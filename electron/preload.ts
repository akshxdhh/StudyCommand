import { contextBridge, ipcRenderer } from 'electron';
import { AppDataStore, DisplayInfo } from './types';

contextBridge.exposeInMainWorld('electronAPI', {
  getStoreData: (): Promise<AppDataStore> => ipcRenderer.invoke('store:get'),
  saveStoreData: (data: Partial<AppDataStore>): Promise<boolean> => ipcRenderer.invoke('store:save', data),
  resetStoreData: (): Promise<AppDataStore> => ipcRenderer.invoke('store:reset'),
  exportData: (): Promise<{ success: boolean; filePath?: string; error?: string }> => ipcRenderer.invoke('store:export'),
  importData: (): Promise<{ success: boolean; data?: AppDataStore; error?: string }> => ipcRenderer.invoke('store:import'),

  showNotification: (options: { title: string; body: string; playSound?: boolean }): Promise<boolean> =>
    ipcRenderer.invoke('notification:show', options),
  testNotification: (): Promise<boolean> => ipcRenderer.invoke('notification:test'),

  setStartupSetting: (enable: boolean): Promise<boolean> => ipcRenderer.invoke('app:setStartup', enable),
  getStartupSetting: (): Promise<boolean> => ipcRenderer.invoke('app:getStartup'),
  openPath: (targetPath: string): Promise<boolean> => ipcRenderer.invoke('app:openPath', targetPath),
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke('app:openExternal', url),

  minimizeWindow: (): void => ipcRenderer.send('window:minimize'),
  maximizeWindow: (): void => ipcRenderer.send('window:maximize'),
  closeWindow: (): void => ipcRenderer.send('window:close'),
  quitApp: (): void => ipcRenderer.send('app:quit'),

  // V3 Methods:
  setFullScreen: (flag: boolean): Promise<boolean> => ipcRenderer.invoke('window:setFullScreen', flag),
  isFullScreen: (): Promise<boolean> => ipcRenderer.invoke('window:isFullScreen'),
  getDisplays: (): Promise<DisplayInfo[]> => ipcRenderer.invoke('desktop:getDisplays'),
  moveToDisplay: (displayId: number): Promise<boolean> => ipcRenderer.invoke('desktop:moveToDisplay', displayId),
  selectPdfFile: (): Promise<string | null> => ipcRenderer.invoke('pdf:selectFile'),
  parsePdfFile: (filePath?: string): Promise<{ success: boolean; text?: string; numpages?: number; error?: string; filename?: string }> =>
    ipcRenderer.invoke('pdf:parseFile', filePath),
  saveUploadedPdf: (filename: string, fileBufferBase64: string): Promise<{ success: boolean; savedPath?: string; error?: string }> =>
    ipcRenderer.invoke('pdf:saveUploadedPdf', filename, fileBufferBase64),

  // Storage & Cache management
  getCacheSize: (): Promise<number> => ipcRenderer.invoke('storage:getCacheSize'),
  clearCache: (): Promise<{ success: boolean; bytesCleared: number }> => ipcRenderer.invoke('storage:clearCache'),
  clearUserData: (options: { profileOnly?: boolean; profileId?: string }): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('storage:clearUserData', options),
  factoryReset: (): Promise<{ success: boolean }> => ipcRenderer.invoke('storage:factoryReset'),

  onNotificationClicked: (callback: () => void): (() => void) => {
    const handler = () => callback();
    ipcRenderer.on('notification-clicked', handler);
    return () => {
      ipcRenderer.removeListener('notification-clicked', handler);
    };
  },

  onStoreUpdated: (callback: (data: AppDataStore) => void): (() => void) => {
    const handler = (_event: any, data: AppDataStore) => callback(data);
    ipcRenderer.on('store-updated', handler);
    return () => {
      ipcRenderer.removeListener('store-updated', handler);
    };
  },

  onDistractionAlert: (callback: (data: { message: string }) => void): (() => void) => {
    const handler = (_event: any, data: { message: string }) => callback(data);
    ipcRenderer.on('focus:distraction-alert', handler);
    return () => {
      ipcRenderer.removeListener('focus:distraction-alert', handler);
    };
  },
});
