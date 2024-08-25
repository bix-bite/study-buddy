/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';

import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { IpcMainInvokeEvent } from 'electron/main';
import { resolveHtmlPath, ffMpegPath } from './util';
import SimpleElectronStore from './backend/SimpleElectronStore';
import ChatService, { IChatServiceResponse } from './backend/ChatService';
import Shared from '../shared';
import { exec, execSync } from 'child_process';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

const dataStore = new SimpleElectronStore();
const chatSvc = new ChatService();
ipcMain.handle(
  'transcribe',
  async (
    event: IpcMainInvokeEvent,
    file: string,
  ): Promise<IChatServiceResponse> => {
    console.log(`OpenAI ChatService Transcribe`);
    return chatSvc.transcribe(file);
  },
);
ipcMain.handle(
  'groq-transcribe',
  async (
    event: IpcMainInvokeEvent,
    file: string,
  ): Promise<IChatServiceResponse> => {
    console.log(`Groq ChatService Transcribe`);
    return chatSvc.groqTranscribe(file);
  },
);
ipcMain.handle(
  'transcriptSummary',
  async (
    event: IpcMainInvokeEvent,
    transcript: string,
  ): Promise<IChatServiceResponse> => {
    console.log(`ChatService transcript summary`);
    return chatSvc.transcriptSummary(transcript);
  },
);

ipcMain.handle(
  'transcriptStudyGuide',
  async (
    event: IpcMainInvokeEvent,
    transcript: string,
  ): Promise<IChatServiceResponse> => {
    console.log(`ChatService study guide`);
    return chatSvc.transcriptStudyGuide(transcript);
  },
);
ipcMain.handle(
  'store-get',
  (event: IpcMainInvokeEvent, store: string, key: string) =>
    dataStore.get(store, key),
);
ipcMain.handle('data-path', () => dataStore.getUserDataPath());

ipcMain.handle('store-fileinfo', (event: IpcMainInvokeEvent, store: string) =>
  dataStore.getFileInfo(store),
);
ipcMain.handle(
  'store-delete',
  (event: IpcMainInvokeEvent, store: string, key: string) =>
    dataStore.delete(store, key),
);
ipcMain.handle(
  'store-set',
  (event: IpcMainInvokeEvent, store: string, key: string, value: any) =>
    dataStore.set(store, key, value),
);

ipcMain.handle(
  'ipc-example',
  async (event: IpcMainInvokeEvent, arg: string[]) => {
    const msgTemplate = (pingPong: string) =>
      `IPC test reply from ${arg.join(',')}: ${pingPong}`;
    return msgTemplate('pong');
  },
);

// Handle the save-audio event
ipcMain.handle('save-audio', async (event, arrayBuffer): Promise<string> => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{ name: 'Audio Files', extensions: ['mp3'] }],
    defaultPath: `recording_${Shared.formattedNow()}.mp3`,
  });

  if (!canceled && filePath) {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFile(filePath, buffer, (err) => {
        if (err) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject(`Failed to save the file: ${err}`);
        }
        resolve(filePath);
      });
    });
  }
  return '';
});

ipcMain.handle('compress-audio', async (event, file): Promise<string> => {
  const outfile = `${dataStore.getUserDataPath()}/${Shared.formattedNow()}_compressed.ogg`;
  const cmd = `${ffMpegPath()}  -i "${file}" -vn -map_metadata -1 -ac 1 -c:a libopus -b:a 12k -application voip ${outfile}`;
  // const cmd = `${ffMpegPath()}  -i "${file}"  -c:a libvorbis -q:a 4 ${outfile}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (err) => {
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Failed to compress the file: ${err}`);
      }
      resolve(outfile);
    });
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 2048,
    height: 1024,
    icon: getAssetPath('bixbitelogo.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
