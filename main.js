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
}

app.whenReady().then(() => {
  createWindow();

  const sendUpdateStatus = (status) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('update_status', status);
  };

  if (!app.isPackaged) {
    sendUpdateStatus('Auto-atualização disponível apenas na versão instalada.');
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.forceCodeSignatureVerification = false; // Permite atualização sem assinatura digital

  const checkUpdates = async () => {
    try {
      sendUpdateStatus(`Checando atualizações... (v${app.getVersion()})`);
      await autoUpdater.checkForUpdates();
    } catch (err) {
      const message = err?.message || String(err);
      sendUpdateStatus(`Erro ao checar atualização: ${message}`);
    }
  };

  setTimeout(checkUpdates, 5000);
  setInterval(checkUpdates, 4 * 60 * 60 * 1000);

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

ipcMain.handle('print-data', async (event, { data, printerName }) => {
  const { execFile } = require('child_process');
  console.log('=== [PRINT-DATA] Iniciando Impressão via Auxiliar C# (v1.1.30) ===');

  try {
    if (!data || !Array.isArray(data)) throw new Error("Dados inválidos");

    // Comandos ESC/POS Básicos
    const ESC = '\x1b';
    const GS = '\x1d';
    const commands = {
      reset: ESC + '@',
      boldOn: ESC + 'E\x01',
      boldOff: ESC + 'E\x00',
      alignCenter: ESC + 'a\x01',
      alignLeft: ESC + 'a\x00',
      alignRight: ESC + 'a\x02',
      sizeNormal: GS + '!\x00',
      sizeDouble: GS + '!\x11', // 2x Largura e 2x Altura
    };

    let buffer = Buffer.from(commands.reset + commands.alignCenter);

    const iconv = require('iconv-lite');
    const toBytes = (text) => iconv.encode(text + '\n', 'cp850');

    data.forEach(item => {
      if (item.type === 'text') {
        let styleCmd = '';
        if (item.style) {
          if (item.style.textAlign === 'center') buffer = Buffer.concat([buffer, Buffer.from(commands.alignCenter)]);
          if (item.style.textAlign === 'left') buffer = Buffer.concat([buffer, Buffer.from(commands.alignLeft)]);
          if (item.style.textAlign === 'right') buffer = Buffer.concat([buffer, Buffer.from(commands.alignRight)]);

          if (item.style.fontWeight === 'bold' || item.style.fontWeight === '700') buffer = Buffer.concat([buffer, Buffer.from(commands.boldOn)]);
          if (item.style.fontSize) {
            const size = parseInt(item.style.fontSize);
            if (size >= 24) buffer = Buffer.concat([buffer, Buffer.from(commands.sizeDouble)]);
            else buffer = Buffer.concat([buffer, Buffer.from(commands.sizeNormal)]);
          }
        }

        buffer = Buffer.concat([buffer, toBytes(item.value)]);

        // Reset styles for next item
        buffer = Buffer.concat([buffer, Buffer.from(commands.boldOff + commands.sizeNormal)]);
      } else if (item.type === 'table') {
        // Implementação simplificada de tabela para modo texton
        item.tableBody?.forEach(row => {
          const line = row.join(' ').substring(0, 32);
          buffer = Buffer.concat([buffer, toBytes(line)]);
        });
      }
    });

    // Avanço de papel e Corte
    buffer = Buffer.concat([buffer, Buffer.from('\n\n' + GS + 'V\x42\x00')]);

    const tempPath = path.join(app.getPath('temp'), `print_${Date.now()}.bin`);
    fs.writeFileSync(tempPath, buffer);

    const exePath = app.isPackaged
      ? path.join(process.resourcesPath, 'FlowEstacPrinter.exe')
      : path.join(__dirname, 'FlowEstacPrinter.exe');

    // Se o asar estiver desativado, o path continua sendo __dirname em alguns casos, 
    // mas vamos garantir verificando a existência
    const finalExePath = fs.existsSync(exePath) ? exePath : path.join(__dirname, 'FlowEstacPrinter.exe');

    return new Promise((resolve) => {
      execFile(finalExePath, [printerName || 'Generic / Text Only', tempPath], (error, stdout, stderr) => {
        try { fs.unlinkSync(tempPath); } catch (e) { }

        if (error) {
          console.error('Erro no auxiliar de impressão:', error);
          resolve({ success: false, error: error.message });
        } else {
          console.log('Resultado do auxiliar:', stdout);
          resolve({ success: true });
        }
      });
    });

  } catch (error) {
    console.error("=== [PRINT-DATA] Erro Crítico:", error);
    return { success: false, error: error.message };
  }
});


// listeners do autoUpdater
autoUpdater.on('checking-for-update', () => {
  console.log('Checando por atualiza\u00e7\u00f5es...');
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('update_status', 'Checando por atualiza\u00e7\u00f5es...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Atualiza\u00e7\u00e3o dispon\u00edvel.');
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('update_status', `Atualiza\u00e7\u00e3o dispon\u00edvel: v${info.version}`);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Nenhuma atualiza\u00e7\u00e3o dispon\u00edvel.');
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('update_status', 'Sistema atualizado.');
});

autoUpdater.on('error', (err) => {
  console.error('Erro no autoUpdater:', err);
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('update_status', `Erro na atualiza\u00e7\u00e3o: ${err.message}`);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Progresso do download: ${progressObj.percent}%`);
  const win = BrowserWindow.getAllWindows()[0];
  if (win) win.webContents.send('update_status', `Baixando: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Atualiza\u00e7\u00e3o baixada; pronta para instalar.');
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send('update_status', 'Atualiza\u00e7\u00e3o pronta para instalar.');
    win.webContents.send('update_ready');
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

// --- NFSE Emission ---
ipcMain.handle('emit-nfse', async (event, { movement, config }) => {
  const { execFile } = require('child_process');
  console.log('=== [NFSE] Iniciando Emissão via Auxiliar C# ===');

  return new Promise((resolve) => {
    // Caminho para o executÃ¡vel C# (deve estar na mesma pasta ou em 'extraResources')
    const exePath = path.join(process.resourcesPath || __dirname, 'FlowEstacNfse.exe');

    // Se o executável não existir ainda, apenas logamos e retornamos sucesso fictício para teste do fluxo
    if (!fs.existsSync(exePath)) {
      console.warn('Módulo FlowEstacNfse.exe não encontrado. Simulando sucesso para teste do fluxo.');
      return resolve({ success: true, message: 'Nota simulada (Módulo C# ausente).' });
    }

    const inputData = JSON.stringify({ movement, config });

    execFile(exePath, [inputData], (error, stdout, stderr) => {
      if (error) {
        console.error('Erro ao executar FlowEstacNfse.exe:', error);
        return resolve({ success: false, error: stderr || error.message });
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (e) {
        resolve({ success: true, message: 'Nota enviada para processamento.' });
      }
    });
  });
});

// --- Certificate Info Extraction ---
ipcMain.handle('check-certificate-info', async (event, { certPath, certPassword }) => {
  const fs = require('fs');
  console.log('=== [CERT] Verificando validade do certificado ===');

  if (!certPath || !fs.existsSync(certPath)) {
    return { success: false, error: 'Arquivo do certificado não encontrado.' };
  }

  // Como extrair info de PFX no Node sem bibliotecas externas pesadas é complexo,
  // e o usuário já tem um auxiliar C#, vamos delegar essa leitura para o FlowEstacNfse.exe
  // ou tentar uma leitura básica de metadados se possível.
  // Para manter a robustez, chamaremos o .exe com um comando de "info".

  const { execFile } = require('child_process');
  const exePath = path.join(process.resourcesPath || __dirname, 'FlowEstacNfse.exe');

  if (!fs.existsSync(exePath)) {
    // Mock para desenvolvimento se o .exe não existir
    const mockExpiration = new Date();
    mockExpiration.setFullYear(mockExpiration.getFullYear() + 1);
    return {
      success: true,
      expiration: mockExpiration.toISOString(),
      subject: 'Certificado de Teste (Módulo C# Ausente)',
      isMock: true
    };
  }

  return new Promise((resolve) => {
    const inputData = JSON.stringify({ action: 'check-cert', certPath, certPassword });
    execFile(exePath, [inputData], (error, stdout, stderr) => {
      if (error) return resolve({ success: false, error: stderr || error.message });
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        resolve({ success: false, error: 'Falha ao processar resposta do módulo NFSE.' });
      }
    });
  });
});

// --- Asaas Licensing ---
ipcMain.handle('check-asaas-license', async (event, { cnpj }) => {
  const https = require('https');
  const apiKey = process.env.ASAAS_API_KEY;
  console.log(`=== [ASAAS] Verificando licença para CNPJ: ${cnpj} ===`);

  if (!apiKey) return { success: false, error: 'Chave de API do Asaas não configurada.' };

  const sanitizedCnpj = cnpj.replace(/\D/g, '');

  const options = {
    hostname: 'api.asaas.com',
    port: 443,
    path: `/v3/customers?cpfCnpj=${sanitizedCnpj}`,
    method: 'GET',
    headers: {
      'access_token': apiKey,
      'User-Agent': 'FlowEstac-Desktop'
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const customers = JSON.parse(data);
          if (!customers.data || customers.data.length === 0) {
            return resolve({ success: true, status: 'active', message: 'Cliente não encontrado no Asaas. Liberado por padrão.' });
          }

          const customerId = customers.data[0].id;

          const payOptions = {
            ...options,
            path: `/v3/payments?customer=${customerId}&status=OVERDUE`
          };

          const payReq = https.request(payOptions, (payRes) => {
            let payData = '';
            payRes.on('data', (chunk) => payData += chunk);
            payRes.on('end', () => {
              try {
                const payments = JSON.parse(payData);
                if (payments.data && payments.data.length > 0) {
                  resolve({ success: true, status: 'blocked', message: 'Existem mensalidades pendentes no Asaas.' });
                } else {
                  resolve({ success: true, status: 'active' });
                }
              } catch (e) {
                resolve({ success: false, error: 'Erro ao processar pagamentos do Asaas.' });
              }
            });
          });
          payReq.on('error', (e) => resolve({ success: false, error: e.message }));
          payReq.end();

        } catch (e) {
          resolve({ success: false, error: 'Erro ao processar resposta do Asaas.' });
        }
      });
    });

    req.on('error', (e) => resolve({ success: false, error: e.message }));
    req.end();
  });
});



