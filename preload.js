const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Sistema
    getVersion: () => process.versions.electron,
    platform: process.platform,
    
    // Salvar/Carregar
    saveGame: (data) => ipcRenderer.invoke('save-game', data),
    loadGame: (filename) => ipcRenderer.invoke('load-game', filename),
    getSaves: () => ipcRenderer.invoke('get-saves'),
    
    // Eventos do menu
    onMenuAction: (callback) => ipcRenderer.on('menu-action', callback),
    onGraphicsSetting: (callback) => ipcRenderer.on('graphics-setting', callback),
    onGameReady: (callback) => ipcRenderer.on('game-ready', callback),
    
    // Utilitários
    showInFolder: (path) => ipcRenderer.send('show-in-folder', path),
    
    // Janela
    setFullScreen: (flag) => ipcRenderer.send('set-fullscreen', flag),
    
    // Notificações
    showNotification: (title, body) => {
        new Notification(title, { body });
    }
});
