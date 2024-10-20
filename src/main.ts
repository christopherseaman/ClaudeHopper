import { app, BrowserWindow, nativeImage, globalShortcut, Menu } from 'electron';
import { menubar } from 'menubar';
import * as path from 'path';

let tray = null;

const indexPath = path.join(app.getAppPath(), 'index.html');
const indexUrl = `file://${indexPath}`;

const iconPath = path.join(app.getAppPath(), 'assets', 'IconTemplate.png');
let trayIcon = nativeImage.createFromPath(iconPath);

// Optionally resize the icon if needed
trayIcon = trayIcon.resize({ width: 16, height: 16 });

const mb = menubar({
  index: indexUrl,
  preloadWindow: true,
  browserWindow: {
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  },
  icon: trayIcon,
  showOnAllWorkspaces: false,
  showDockIcon: false,
  showOnRightClick: false,
});

mb.on('ready', () => {
  console.log('Menubar app is ready.');

  tray = mb.tray;
  tray.setToolTip('ClaudeHopper');

  // Prevent the default toggle behavior if needed
  // mb.tray.removeAllListeners('click');

  // Additional setup can go here
});

mb.on('after-create-window', () => {
  if (process.env.NODE_ENV === 'development') {
    mb.window?.webContents.openDevTools();
  }
});

// Handle 'activate' event for macOS
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mb.app.emit('ready');
  }
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
