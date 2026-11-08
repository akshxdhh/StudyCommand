import { contextBridge, ipcRenderer } from 'electron';
import { AppDataStore } from './types';

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
});
