const { app, BrowserWindow, ipcMain, Menu, globalShortcut } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// Check if running in development mode
const isDev = process.argv.includes('--dev');

// Set up electron-reload in development mode
if (isDev) {
  try {
    // Only attempt to load electron-reload if it's installed
    const fs = require('fs');
    const electronReloadPath = path.join(__dirname, 'node_modules', 'electron-reload');
    if (fs.existsSync(electronReloadPath)) {
      require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
      });
      console.log('Electron reload is active. App will reload on file changes.');
    } else {
      console.log('electron-reload not found. Auto-reload disabled.');
    }
  } catch (err) {
    console.error('Failed to initialize electron-reload:', err);
  }
}

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Handle window being closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Create menu with reload option
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { 
          label: 'Reload App',
          accelerator: process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          } 
        },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow();
  
  // Register global shortcut for reload
  globalShortcut.register(process.platform === 'darwin' ? 'Cmd+R' : 'Ctrl+R', () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle IPC messages from renderer process
ipcMain.handle('run-script', async (event, scriptPath, args) => {
  return new Promise((resolve, reject) => {
    const fullScriptPath = path.join('/home/msloan/gitprojects/aws-starter/scripts', scriptPath);
    console.log(`Running script: ${fullScriptPath} ${args.join(' ')}`);
    
    exec(`${fullScriptPath} ${args.join(' ')}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running script: ${error.message}`);
        reject({ error: error.message, stderr });
        return;
      }
      if (stderr) {
        console.warn(`Script warning: ${stderr}`);
      }
      console.log(`Script output: ${stdout}`);
      resolve(stdout);
    });
  });
});
