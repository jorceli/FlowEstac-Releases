const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Envia dados para serem salvos no processo principal.
   */
  saveData: (key, data) => ipcRenderer.send('save-data', { key, data }),

  /**
   * Solicita dados do processo principal.
   */
  loadData: (key, initialData) => ipcRenderer.invoke('load-data', { key, initialData }),

  /**
   * Registra um callback para ser executado quando uma atualização for baixada.
   */
  onUpdateReady: (callback) => ipcRenderer.on('update_ready', (_event, ...args) => callback(...args)),

  /**
   * Envia um comando para o processo principal para reiniciar e instalar a atualização.
   */
  restartApp: () => ipcRenderer.send('restart_app'),
  onUpdateStatus: (callback) => ipcRenderer.on('update_status', (event, status) => callback(status)),

  /**
   * Reinicia o computador.
   */
  restartComputer: () => ipcRenderer.send('system-reboot'),

  /**
   * Desliga o computador.
   */
  shutdownComputer: () => ipcRenderer.send('system-shutdown'),

  /**
   * Obtém a lista de impressoras do sistema.
   */
  getPrinters: () => ipcRenderer.invoke('get-printers'),

  /**
   * Imprime conteúdo HTML silenciosamente.
   */
  printHtml: (content, printerName, printWidth) => ipcRenderer.invoke('print-html', { content, printerName, printWidth }),

  /**
   * Imprime dados estruturados usando electron-pos-printer.
   */
  printData: (data, printerName, width) => ipcRenderer.invoke('print-data', { data, printerName, width }),

  /**
   * Obtém a versão do aplicativo.
   */
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  /**
   * Dispara a emissão de NFSE via módulo externo.
   */
  emitNfse: (movement, config) => ipcRenderer.invoke('emit-nfse', { movement, config }),

  /**
   * Verifica informações de validade e titular do certificado digital.
   */
  checkCertificateInfo: (certPath, certPassword) => ipcRenderer.invoke('check-certificate-info', { certPath, certPassword }),

  /**
   * Verifica o status da licença no Asaas.
   */
  checkAsaasLicense: (cnpj) => ipcRenderer.invoke('check-asaas-license', { cnpj }),

  /**
   * Fecha a aplicação.
   */
  closeApp: () => ipcRenderer.send('app-close'),
});