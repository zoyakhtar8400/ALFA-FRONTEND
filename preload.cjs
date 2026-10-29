const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getSystemPrinters: () => ipcRenderer.invoke('get-system-printers'),
  printSilent: (options) => ipcRenderer.invoke('print-receipt-silent', options),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (cfg) => ipcRenderer.invoke('save-config', cfg),
  testConnection: (url) => ipcRenderer.invoke('test-connection', url),
  checkBackendStatus: () => ipcRenderer.invoke('check-backend-status'),
  startLocalBackend: () => ipcRenderer.invoke('start-local-backend'),
  stopLocalBackend: () => ipcRenderer.invoke('stop-local-backend'),
});


