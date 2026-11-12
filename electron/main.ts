import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, shell, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { StoreManager } from './store';
import { BackgroundScheduler } from './scheduler';

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const storeManager = new StoreManager();
const scheduler = new BackgroundScheduler(storeManager, () => mainWindow);

function getIconPath(): string {
  // Check build/icon.png or fallback to dist/assets
  const possiblePaths = [
    path.join(__dirname, '../build/icon.ico'),
    path.join(__dirname, '../build/icon.png'),
    path.join(__dirname, '../../build/icon.ico'),
    path.join(__dirname, '../../build/icon.png'),
    path.join(process.cwd(), 'build/icon.png'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

function createTrayIcon(): Electron.NativeImage {
  const iconPath = getIconPath();
  if (iconPath) {
    return nativeImage.createFromPath(iconPath);
  }
  // Create a 16x16 fallback bitmap if file not yet generated
  return nativeImage.createEmpty();
}

function updateTrayMenu() {
  if (!tray) return;

  const isPaused = scheduler.getIsPaused();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'STUDY COMMAND',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Open Dashboard',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Start Study Session',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('notification-clicked');
        }
      },
    },
    { type: 'separator' },
    {
      label: isPaused ? 'Resume Reminders' : 'Pause Reminders',
      click: () => {
        if (isPaused) {
          scheduler.resumeReminders();
        } else {
          scheduler.pauseReminders();
        }
        updateTrayMenu();
      },
    },
    {
      label: 'Send Test Notification',
      click: () => {
        scheduler.sendTestNotification();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Application',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('STUDY COMMAND – Exam Prep & Accountability');
}

function createWindow(): void {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1080,
    minHeight: 700,
    frame: false, // Custom futuristic command center titlebar
    backgroundColor: '#080a0f',
    show: false,
    icon: iconPath || undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false, // Keep timers accurate in background
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  const distIndex = path.join(__dirname, '../dist/index.html');

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      if (fs.existsSync(distIndex)) {
        mainWindow?.loadFile(distIndex);
      }
    });
  } else {
    mainWindow.loadFile(distIndex);
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      const data = storeManager.getData();
      if (data.settings.minimizeToTrayOnClose) {
        event.preventDefault();
        mainWindow?.hide();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupTray(): void {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  updateTrayMenu();

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function setupIPC(): void {
  ipcMain.handle('store:get', async () => {
    return storeManager.getData();
  });

  ipcMain.handle('store:save', async (_event, partial) => {
    storeManager.updateData(partial);
    // Broadcast change to renderer
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('store-updated', storeManager.getData());
    }
    return true;
  });

  ipcMain.handle('store:reset', async () => {
    const fresh = storeManager.resetToDefaults();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('store-updated', fresh);
    }
    return fresh;
  });

  ipcMain.handle('store:export', async () => {
    if (!mainWindow) return { success: false, error: 'No main window' };
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export STUDY COMMAND Data',
      defaultPath: `study-command-backup-${storeManager.getTodayDateString()}.json`,
      filters: [{ name: 'JSON Data', extensions: ['json'] }],
    });
    if (canceled || !filePath) return { success: false };
    try {
      storeManager.exportToFile(filePath);
      return { success: true, filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('store:import', async () => {
    if (!mainWindow) return { success: false, error: 'No main window' };
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import STUDY COMMAND Data',
      filters: [{ name: 'JSON Data', extensions: ['json'] }],
      properties: ['openFile'],
    });
    if (canceled || !filePaths || filePaths.length === 0) return { success: false };
    try {
      const imported = storeManager.importFromFile(filePaths[0]);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('store-updated', imported);
      }
      return { success: true, data: imported };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('notification:show', async (_event, { title, body, playSound }) => {
    return scheduler.triggerNotification(title, body, playSound);
  });

  ipcMain.handle('notification:test', async () => {
    return scheduler.sendTestNotification();
  });

  ipcMain.handle('app:setStartup', async (_event, enable: boolean) => {
    try {
      app.setLoginItemSettings({
        openAtLogin: enable,
        openAsHidden: true,
        path: process.execPath,
      });
      return true;
    } catch (err) {
      console.error('Failed to set startup settings:', err);
      return false;
    }
  });

  ipcMain.handle('app:getStartup', async () => {
    try {
      const settings = app.getLoginItemSettings();
      return settings.openAtLogin;
    } catch {
      return false;
    }
  });

  ipcMain.handle('app:openPath', async (_event, targetPath: string) => {
    try {
      if (!targetPath) return false;
      if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
        await shell.openExternal(targetPath);
        return true;
      }
      let resolved = targetPath;
      if (!path.isAbsolute(targetPath)) {
        resolved = path.resolve(process.cwd(), targetPath);
      }
      if (!fs.existsSync(resolved)) {
        const inResources = path.join(process.resourcesPath, targetPath);
        if (fs.existsSync(inResources)) {
          resolved = inResources;
        } else {
          const inAppDir = path.join(__dirname, '..', targetPath);
          if (fs.existsSync(inAppDir)) {
            resolved = inAppDir;
          }
        }
      }
      if (fs.existsSync(resolved)) {
        await shell.openPath(resolved);
        return true;
      }
      console.warn('PDF path not found on disk:', targetPath);
      return false;
    } catch (err) {
      console.error('Failed to open path:', err);
      return false;
    }
  });



  ipcMain.handle('app:openExternal', async (_event, url: string) => {
    try {
      if (!url) return false;
      await shell.openExternal(url);
      return true;
    } catch (err) {
      console.error('Failed to open external url:', err);
      return false;
    }
  });

  // V3 IPC Handlers
  ipcMain.handle('window:setFullScreen', async (_event, flag: boolean) => {
    if (mainWindow) {
      mainWindow.setFullScreen(flag);
      return mainWindow.isFullScreen();
    }
    return false;
  });

  ipcMain.handle('window:isFullScreen', async () => {
    return mainWindow?.isFullScreen() ?? false;
  });

  ipcMain.handle('desktop:getDisplays', async () => {
    const displays = screen.getAllDisplays();
    const primary = screen.getPrimaryDisplay();
    return displays.map((d, index) => ({
      id: d.id,
      label: d.id === primary.id
        ? `Display ${index + 1} (Primary - ${d.bounds.width}x${d.bounds.height})`
        : `Display ${index + 1} (${d.bounds.width}x${d.bounds.height})`,
      bounds: d.bounds,
      workArea: d.workArea,
      scaleFactor: d.scaleFactor,
      isPrimary: d.id === primary.id,
    }));
  });

  ipcMain.handle('desktop:moveToDisplay', async (_event, displayId: number) => {
    if (!mainWindow) return false;
    const displays = screen.getAllDisplays();
    const target = displays.find((d) => d.id === displayId);
    if (target) {
      mainWindow.setBounds({
        x: target.bounds.x + 40,
        y: target.bounds.y + 40,
        width: Math.min(1360, target.workArea.width - 80),
        height: Math.min(860, target.workArea.height - 80),
      });
      return true;
    }
    return false;
  });

  ipcMain.handle('pdf:selectFile', async () => {
    if (!mainWindow) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Syllabus or Timetable PDF',
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      properties: ['openFile'],
    });
    if (canceled || !filePaths || filePaths.length === 0) return null;
    return filePaths[0];
  });

  ipcMain.handle('pdf:parseFile', async (_event, filePathArg?: string) => {
    let filePath = filePathArg;
    if (!filePath) {
      if (!mainWindow) return { success: false, error: 'No main window' };
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        title: 'Select Syllabus or Timetable PDF',
        filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
        properties: ['openFile'],
      });
      if (canceled || !filePaths || filePaths.length === 0) {
        return { success: false, error: 'File selection canceled' };
      }
      filePath = filePaths[0];
    }
    try {
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `File not found: ${filePath}` };
      }
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(pdfBuffer);
      return {
        success: true,
        text: parsed.text,
        numpages: parsed.numpages,
        filename: path.basename(filePath),
      };
    } catch (err: any) {
      console.error('Failed to parse PDF document:', err);
      return { success: false, error: err.message || 'Failed to parse PDF document' };
    }
  });

  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });

  ipcMain.on('app:quit', () => {
    isQuitting = true;
    app.quit();
  });
}

// App lifecycle
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    if (!mainWindow.isVisible()) mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  setupIPC();
  createWindow();
  setupTray();
  scheduler.start();

  // Synchronize startup configuration on launch
  const data = storeManager.getData();
  if (data.settings.launchOnStartup) {
    app.setLoginItemSettings({
      openAtLogin: true,
      openAsHidden: true,
      path: process.execPath,
    });
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  scheduler.stop();
});
