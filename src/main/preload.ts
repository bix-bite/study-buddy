// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    saveAudio: (buffer: Buffer) =>
      ipcRenderer.invoke('save-audio', buffer),
    StoreGet: (store: string, key: string) =>
      ipcRenderer.invoke('store-get', store, key),
    StoreSet: (store: string, key: string, value: any) =>
      ipcRenderer.invoke('store-set', store, key, value),
    StoreDelete: (store: string, key: string) =>
      ipcRenderer.invoke('store-delete', store, key),
    sendMessage: (channel: Channels, ...args: unknown[]) =>
      ipcRenderer.invoke(channel, ...args),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
