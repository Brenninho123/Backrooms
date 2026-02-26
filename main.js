const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Função para criar a janela principal
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.ico'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false
        },
        frame: true,
        titleBarStyle: 'default',
        backgroundColor: '#000000',
        show: false
    });

    // Carregar o jogo
    mainWindow.loadFile('index.html');

    // Mostrar quando estiver pronto
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Splash screen effect
        setTimeout(() => {
            mainWindow.webContents.send('game-ready');
        }, 2000);
    });

    // Menu personalizado
    const menuTemplate = [
        {
            label: 'Arquivo',
            submenu: [
                {
                    label: 'Novo Jogo',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'new-game');
                    }
                },
                {
                    label: 'Carregar Jogo',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'load-game');
                    }
                },
                {
                    label: 'Salvar Jogo',
                    click: () => {
                        mainWindow.webContents.send('menu-action', 'save-game');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Sair',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Configurações',
            submenu: [
                {
                    label: 'Tela Cheia',
                    accelerator: 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                {
                    label: 'Desempenho',
                    submenu: [
                        {
                            label: 'Baixo',
                            click: () => {
                                mainWindow.webContents.send('graphics-setting', 'low');
                            }
                        },
                        {
                            label: 'Médio',
                            click: () => {
                                mainWindow.webContents.send('graphics-setting', 'medium');
                            }
                        },
                        {
                            label: 'Alto',
                            click: () => {
                                mainWindow.webContents.send('graphics-setting', 'high');
                            }
                        }
                    ]
                }
            ]
        },
        {
            label: 'Ajuda',
            submenu: [
                {
                    label: 'Controles',
                    click: () => {
                        mainWindow.webContents.send('show-controls');
                    }
                },
                {
                    label: 'Sobre',
                    click: () => {
                        mainWindow.webContents.send('show-about');
                    }
                },
                {
                    label: 'GitHub',
                    click: () => {
                        shell.openExternal('https://github.com/Brenninho123/Backrooms');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);

    // Developer Tools (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Evento de fechar
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Quando o app estiver pronto
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Fechar app quando todas as janelas estiverem fechadas
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers para salvar/carregar
ipcMain.handle('save-game', async (event, data) => {
    const savePath = path.join(app.getPath('documents'), 'Backrooms-Saves');
    
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
    }

    const saveFile = path.join(savePath, `save_${Date.now()}.json`);
    fs.writeFileSync(saveFile, JSON.stringify(data, null, 2));
    
    return { success: true, path: saveFile };
});

ipcMain.handle('load-game', async (event, filename) => {
    const savePath = path.join(app.getPath('documents'), 'Backrooms-Saves');
    const saveFile = path.join(savePath, filename);
    
    if (fs.existsSync(saveFile)) {
        const data = fs.readFileSync(saveFile, 'utf8');
        return JSON.parse(data);
    }
    
    return null;
});

ipcMain.handle('get-saves', async () => {
    const savePath = path.join(app.getPath('documents'), 'Backrooms-Saves');
    
    if (!fs.existsSync(savePath)) {
        return [];
    }

    const files = fs.readdirSync(savePath);
    return files.filter(f => f.endsWith('.json')).map(f => {
        const stats = fs.statSync(path.join(savePath, f));
        return {
            name: f,
            time: stats.mtime,
            size: stats.size
        };
    });
});
