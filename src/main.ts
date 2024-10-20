import { app, BrowserWindow, nativeImage, globalShortcut, Menu, ipcMain } from 'electron';
import { menubar } from 'menubar';
import * as path from 'path';
import { buildApiHandler, ApiConfiguration, ApiHandler } from '../cline/src/api/index'; // Added ApiHandler import
import { OpenRouterHandler } from '../cline/src/api/providers/openrouter'; // Import OpenRouterHandler for type guard

let tray = null;

const indexPath = path.join(app.getAppPath(), 'index.html');
const indexUrl = `file://${indexPath}`; // Removed escaping

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

  // Register global shortcut for toggling the app window
  const ret: boolean = globalShortcut.register('Control+Space', () => {
    if (mb.window) {
      if (mb.window.isVisible()) {
        mb.window.hide();
      } else {
        mb.window.show();
      }
    }
  });

  if (!ret) {
    console.log('Registration of global shortcut failed.');
  } else {
    console.log('Global shortcut Control+Space registered.');
  }

  // Handle IPC messages
  ipcMain.handle('refreshOpenRouterModels', async () => {
    try {
      const config: ApiConfiguration = {
        apiProvider: 'openrouter',
        openRouterApiKey: 'YOUR_OPENROUTER_API_KEY', // Replace with actual API key or retrieve from secure storage
      };
      const apiHandler = buildApiHandler(config);

      // Type Guard: Check if apiHandler is OpenRouterHandler
      if (isOpenRouterHandler(apiHandler)) {
        const models = await apiHandler.getAllModels();
        // Send the models back to the renderer
        mb.window?.webContents.send('openRouterModels', models);
        return { success: true };
      } else {
        console.log('getAllModels is not implemented for the current API handler.');
        return { success: false, message: 'getAllModels not implemented for the current API provider.' };
      }
    } catch (error: any) { // Explicitly type error as any
      console.error('Error refreshing OpenRouter models:', error);
      return { success: false, message: error.message };
    }
  });

  // Additional setup can go here
});

// Type Guard Function
function isOpenRouterHandler(handler: ApiHandler): handler is OpenRouterHandler {
  return 'getAllModels' in handler && typeof handler.getAllModels === 'function';
}

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

// Unregister all shortcuts when quitting
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
