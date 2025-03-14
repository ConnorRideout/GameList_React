/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'dotenv/config'
// import path from 'path'
import { app, BrowserWindow, shell, ipcMain, net, protocol } from 'electron'
// import { autoUpdater } from 'electron-updater'
// import log from 'electron-log'
import installExtension, {REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'
// import Path from 'pathlib-js'
// import { promises as fs } from 'fs'
// import { promises as fs, existsSync } from 'fs'
import sassVars from 'get-sass-vars'

import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'

import Path from '../parsedPath'
import {
  openDialog,
  messageBox,
} from './dialogs'


// function to parse the sass file `variables.scss` for use later
const getSassVars = async () => {
  const cssFile = new Path('./src/renderer/styles/variables.scss')
  const css = await cssFile.readFile({encoding: 'utf-8'})
  // const css = await fs.readFile('./src/renderer/styles/variables.scss', 'utf-8')
  const json = await sassVars(css)
  return json
}

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

let mainWindow: BrowserWindow | null = null;


ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
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


// made menuBuilder a global var so that custom context menus could be created on specific elements
let menuBuilder: MenuBuilder

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? new Path(process.resourcesPath, 'assets')
    : new Path(__dirname, '../../assets');
  // const RESOURCES_PATH = app.isPackaged
  //   ? path.join(process.resourcesPath, 'assets')
  //   : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return RESOURCES_PATH.join(...paths).path;
    // return path.join(RESOURCES_PATH, ...paths);
  };

  let {$appWidth, $appHeight} = await getSassVars()
  if (typeof $appWidth !== 'string') $appWidth = '700'
  if (typeof $appHeight !== 'string') $appHeight = '1000'

  mainWindow = new BrowserWindow({
    show: false,
    width: parseInt($appWidth, 10) + 20,
    height: parseInt($appHeight, 10) + 35,
    icon: getAssetPath('icon.ico'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: (app.isPackaged
        ? new Path(__dirname, 'preload.js')
        : new Path(__dirname, '../../.erb/dll/preload.js')).path,
    },
    // webPreferences: {
    //   preload: app.isPackaged
    //     ? path.join(__dirname, 'preload.js')
    //     : path.join(__dirname, '../../.erb/dll/preload.js'),
    // },
    resizable: false,
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
    mainWindow.webContents.executeJavaScript(`window.processEnv = ${JSON.stringify(process.env)}`)
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};


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
    // enable the devtools
    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
      .then(res => console.log(`Added Extensions:  ${res}`))
      .catch((err) => console.log('An error occurred: ', err))

    // create the app
    createWindow();
    // app.on('activate', () => {
    //   // On macOS it's common to re-create a window in the app when the
    //   // dock icon is clicked and there are no other windows open.
    //   if (mainWindow === null) createWindow()
    // })


    // handle getting images for img elements
    const imgDir = new Path(
      __dirname,
      '../../src/backend/data',
      process.env.SHOWCASING ? 'showcase/gameImages' : 'development/gameImages'
    )
    protocol.handle('load-image', async (request) => {
      const rawImgPath = request.url
        .replace('load-image://', '')
        .replaceAll('_', ' ')
      const isRelative = !/^[A-Z]\//.test(rawImgPath)
      const imgPath = isRelative ? imgDir.join(rawImgPath) : new Path(rawImgPath.replace(/^([A-Z])/, '$1:'))
      if (rawImgPath && imgPath.existsSync())
        return net.fetch(`file://${imgPath.path}`)
      else
        return new Response('')
    })


    ipcMain.on('open-file-dialog', (event, ...fileArgs) => openDialog(event, mainWindow!, ...fileArgs))

    ipcMain.on('show-message-dialog', (event, ...msgArgs) => messageBox(event, mainWindow!, ...msgArgs))

    ipcMain.on('show-custom-context-menu', (event, x, y, customTemplates) => menuBuilder.buildCustomMenu(x, y, customTemplates))

  })
  .catch(console.log);
