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
  // e evitar A4.
  const options = {
    preview: false,
    width: safeWidth,
    pageSize: '80mm', // Força papel 80mm
    margin: '0 0 0 0',
    copies: 1,
    printerName: printerName,
    timeOutPerLine: 400,
    silent: true,
  };

  console.log('=== [PRINT-DATA] Iniciando Impressão ===');
  console.log('Impressora:', printerName);
  console.log('Opções:', JSON.stringify(options, null, 2));
  console.log('Dados (primeiros 3 itens):', JSON.stringify(data.slice(0, 3), null, 2));

  try {
    if (!data || data.length === 0) {
      throw new Error("Dados de impressão vazios.");
    }
    await PosPrinter.print(data, options);
    console.log('=== [PRINT-DATA] Sucesso na Impressão ===');

    // --- Tenta realizar o corte automático via ESC/POS direto ---
    // Adicionamos um atraso para permitir que o driver do SO complete a impressão antes de tentarmos o acesso direto USB
    setTimeout(() => {
      try {
        console.log('=== [CUT] Tentando comando de corte ESC/POS (após delay)... ===');
        const device = new escpos.USB(); // Tenta encontrar a primeira impressora USB ESC/POS de forma genérica
        const printer = new escpos.Printer(device);
        device.open((err) => {
          if (err) {
            console.warn('=== [CUT] Erro ao abrir dispositivo USB:', err.message);
            return;
          }
          printer
            .feed(2) // Avança um pouco mais
            .cut()
            .close();
          console.log('=== [CUT] Comando enviado com sucesso via ESC/POS Direto ===');
        });
      } catch (cutError) {
        console.warn('=== [CUT] Não foi possível encontrar ou enviar comando para impressora USB direta:', cutError.message);
        // Não falha a operação se o corte direto falhar, pois a impressão já foi concluída via driver
      }
    }, 1500);

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
