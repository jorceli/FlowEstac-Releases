const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Envia dados para serem salvos no processo principal.
   * @param {string} key - A chave de identificação do dado (ex: 'flowestac_customers').
   * @param {any} data - O objeto de dados a ser salvo.
   */
  saveData: (key, data) => ipcRenderer.send('save-data', { key, data }),

  /**
   * Solicita dados do processo principal.
   * @param {string} key - A chave de identificação do dado a ser carregado.
   * @param {any} initialData - Os dados iniciais para usar se o arquivo não existir.
   * @returns {Promise<any>} - Uma promessa que resolve com os dados carregados.
   */
  loadData: (key, initialData) => ipcRenderer.invoke('load-data', { key, initialData }),

  /**
   * Registra um callback para ser executado quando uma atualização for baixada.
   * @param {Function} callback - A função a ser chamada.
   */
  onUpdateReady: (callback) => ipcRenderer.on('update_ready', (_event, ...args) => callback(...args)),

  /**
   * Envia um comando para o processo principal para reiniciar e instalar a atualização.
   */
  restartApp: () => ipcRenderer.send('restart_app'),

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
   * @param {string} content - O conteúdo HTML.
   * @param {string} printerName - Nome da impressora.
   * @param {number} printWidth - Largura da impressão em pixels.
   */
  printHtml: (content, printerName, printWidth) => ipcRenderer.invoke('print-html', { content, printerName, printWidth }),

  /**
   * Imprime dados estruturados usando electron-pos-printer.
   * @param {any[]} data - Array de objetos de dados para impressão.
   * @param {string} printerName - Nome da impressora.
   * @param {number|string} width - Largura da impressão (ex: '100%', '280px').
   */
  printData: (data, printerName, width) => ipcRenderer.invoke('print-data', { data, printerName, width }),

  /**
   * Obtém a versão do aplicativo.
   */
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  /**
   * Fecha a aplicação.
   */
  closeApp: () => ipcRenderer.send('app-close'),
});