const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { exec } = require('child_process');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// Obtém o caminho para a pasta 'Documentos' do usuário e cria o diretório de dados do FlowEstac.
const dataPath = path.join(app.getPath('documents'), 'FlowEstacData');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    fullscreen: true, // Inicia em tela cheia
    minimizable: false, // Remove a possibilidade de minimizar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets/icon.png') // Futuro ícone da aplicação
  });

  const builtIndex = path.join(__dirname, 'renderer', 'index.html');
  if (fs.existsSync(builtIndex)) {
    win.loadFile(builtIndex);
  } else {
    win.loadFile('index.html');
  }

  // Remove o menu padrão (File, Edit, etc.)
  win.setMenu(null);

  // DevTools desativado em produção

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update_ready');
  });
}

app.whenReady().then(() => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers ---

// Salvar e carregar dados
ipcMain.on('save-data', (event, { key, data }) => {
  const filePath = path.join(dataPath, `${key}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Falha ao salvar o arquivo ${key}.json:`, err);
  }
});

ipcMain.handle('load-data', async (event, { key, initialData }) => {
  const filePath = path.join(dataPath, `${key}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileData);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
  } catch (err) {
    console.error(`Falha ao carregar ou criar o arquivo ${key}.json:`, err);
    return initialData;
  }
});

// Atualização da Aplicação
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// Comandos do Sistema
ipcMain.on('system-reboot', () => {
  exec('shutdown /r /t 0');
});

ipcMain.on('system-shutdown', () => {
  exec('shutdown /s /t 0');
});

ipcMain.on('app-close', () => {
  app.quit();
});

// --- Nova Lógica de Impressão (Silent Print) ---

ipcMain.handle('get-printers', async (event) => {
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    return win.webContents.getPrintersAsync();
  }
  return [];
});

ipcMain.handle('print-data', async (event, { data, printerName, width }) => {
  const { PosPrinter } = require('electron-pos-printer');

  // Normaliza a largura para algo aceitável pelo pacote
  // Se width vier como número (ex: 280), converte para '280px'.
  // Se vier vazio, assume '100%'.
  let safeWidth = '100%';
  if (width) {
    if (typeof width === 'number') {
      safeWidth = `${width}px`;
    } else if (typeof width === 'string') {
      safeWidth = width.endsWith('px') || width.endsWith('%') ? width : `${width}px`;
    }
  }

  // Define pageSize explicitamente para 80mm para forçar o driver (se possível)
  // e evitar A4. Algumas impressoras podem precisar de um objeto de tamanho.
  const options = {
    preview: false,
    width: safeWidth,
    pageSize: { height: 100000, width: 80000 }, // Tenta forçar 80mm com altura "infinita" (contínua)
    margin: '0 0 0 0',
    copies: 1,
    printerName: printerName,
    timeOutPerLine: 400,
    silent: true,
  };

  console.log('=== [PRINT-DATA] Iniciando Impressão (v1.1.2) ===');
  console.log('Impressora Selecionada:', printerName);
  console.log('Safe Width:', safeWidth);
  console.log('Opções Aplicadas:', JSON.stringify(options, null, 2));
  console.log('Dados a serem impressos (itens):', data.length);

  try {
    if (!data || data.length === 0) {
      throw new Error("Dados de impressão vazios.");
    }
    await PosPrinter.print(data, options);
    console.log('=== [PRINT-DATA] Sucesso na Impressão ===');

    // --- Tenta realizar o corte automático via ESC/POS direto ---
    // Adicionamos um atraso maior para garantir que o driver do SO complete o envio de dados
    setTimeout(() => {
      try {
        console.log('=== [CUT] Tentando comando de corte ESC/POS direto via USB... ===');
        const device = new escpos.USB(); // Busca dispositivos USB
        const printer = new escpos.Printer(device);

        device.open((err) => {
          if (err) {
            console.warn('=== [CUT] Erro ao abrir dispositivo USB ou nenhum dispositivo encontrado:', err.message);
            return;
          }

          console.log('=== [CUT] Dispositivo USB aberto. Enviando comandos... ===');
          printer
            .feed(3) // Avança 3 linhas para garantir que o texto saiu da cabeça de impressão
            .cut()
            .close();
          console.log('=== [CUT] Comando de corte enviado com sucesso. ===');
        });
      } catch (cutError) {
        console.warn('=== [CUT] Erro na lógica de corte direto:', cutError.message);
        // Não falha a operação de impressão se o corte direto falhar
      }
    }, 2500); // Aumentado para 2.5s para maior segurança

    return { success: true };
  } catch (error) {
    console.error("=== [PRINT-DATA] Erro:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print-html', async (event, { content, printerName, printWidth }) => {
  // Mantendo compatibilidade legada se necessário, mas o foco é print-data
  const width = printWidth ? parseInt(printWidth) + 20 : 300;
  const workerWindow = new BrowserWindow({
    show: false,
    width: width,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  await workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(content));

  const printers = await workerWindow.webContents.getPrintersAsync();
  const printerExists = printers.find(p => p.name === printerName);

  const options = {
    silent: true,
    margins: { marginType: 1 },
    printBackground: false,
    scaleFactor: 100,
  };

  if (printerName && printerExists) {
    options.deviceName = printerName;
  }

  try {
    await workerWindow.webContents.print(options);
    await new Promise(resolve => setTimeout(resolve, 500));
    workerWindow.close();
    return { success: true };
  } catch (error) {
    workerWindow.close();
    console.error("Erro na impressão silenciosa:", error);
    return { success: false, error: error.message };
  }
});
