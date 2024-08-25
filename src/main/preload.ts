// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { IChatServiceResponse } from './backend/ChatService';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    transcribe: (file: string): Promise<IChatServiceResponse> =>
      ipcRenderer.invoke('transcribe', file),
    groqTranscribe: (file: string): Promise<IChatServiceResponse> =>
      ipcRenderer.invoke('groq-transcribe', file),
    transcriptSummary: (transcript: string): Promise<IChatServiceResponse> =>
      ipcRenderer.invoke('transcriptSummary', transcript),
    transcriptStudyGuide: (transcript: string): Promise<IChatServiceResponse> =>
      ipcRenderer.invoke('transcriptStudyGuide', transcript),
    saveAudio: (arrayBuffer: ArrayBuffer) =>
      ipcRenderer.invoke('save-audio', arrayBuffer),
    compressAudio: (audioFile: string) =>
      ipcRenderer.invoke('compress-audio', audioFile),
    StoreGetFileInfo: (store: string, key: string) =>
      ipcRenderer.invoke('store-fileinfo', store, key),
    StoreGet: (store: string, key: string) =>
      ipcRenderer.invoke('store-get', store, key),
    DataPath: (): Promise<string> => ipcRenderer.invoke('data-path'),
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
