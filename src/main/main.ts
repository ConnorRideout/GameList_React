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
import path from 'path'
import { app, BrowserWindow, shell, ipcMain, net, protocol, dialog, MessageBoxSyncOptions } from 'electron'
// import { autoUpdater } from 'electron-updater'
// import log from 'electron-log'
import installExtension, {REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'

import sassVars from 'get-sass-vars'
import { promises as fs, readFile, existsSync, writeFileSync } from 'fs'
import { parse as iniParse, stringify as iniStringify } from 'ini'

import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'

const imgDir = path.join(
  __dirname,
  '../../src/backend/data',
  process.env.SHOWCASING ? 'showcase/gameImages' : 'development/gameImages'
)

const getSassVars = async () => {
  const css = await fs.readFile('./src/renderer/styles/variables.scss', 'utf-8')
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

  let {$appWidth, $appHeight} = await getSassVars()
  if (typeof $appWidth !== 'string') $appWidth = '700'
  if (typeof $appHeight !== 'string') $appHeight = '1000'

  mainWindow = new BrowserWindow({
    show: false,
    width: parseInt($appWidth, 10) + 20,
    height: parseInt($appHeight, 10) + 35,
    icon: getAssetPath('icon.ico'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
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

  const menuBuilder = new MenuBuilder(mainWindow);
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

const iniFile = path.join(__dirname, '../../config.ini')
if (!existsSync(iniFile)) {
  // TODO: prompt user for config.ini defaults
  // config.ini file doesn't exist. create it
  console.log('"config.ini" does not exist. Creating it...')
  const defaultConfig = {
    DEFAULT: {
      games_folder: __dirname,
      locale_emulator: ''
    },
    Ignored_Exes: {'':''}
  }
  const iniString = iniStringify(defaultConfig)
  writeFileSync(iniFile, iniString, 'utf-8')
}

app
  .whenReady()
  .then(() => {
    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
      .then(res => console.log(`Added Extensions:  ${res}`))
      .catch((err) => console.log('An error occurred: ', err))
    protocol.handle('load-image', async (request) => {
      const rawImgPath = request.url
        .replace('load-image://', '')
        .replaceAll('_', ' ')
      const imgPath = path.resolve(imgDir, rawImgPath)
      if (rawImgPath && existsSync(imgPath))
        return net.fetch(`file://${imgPath}`)
      else
        return new Response('')
    })

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow()
    })

    let games_folder = __dirname
    readFile(iniFile, 'utf-8', (err, data) => {
      if (err) {
        console.error(err)
      } else {
        games_folder = iniParse(data).DEFAULT.games_folder
      }
    })

    ipcMain.on('open-file-dialog', (event, title=undefined, dialogType: 'openFile' | 'openDirectory' = 'openFile', initialPath: string = games_folder) => {
      // if it's a full path, use initialPath, otherwise join it to games_folder
      const isRelative = !/^[A-Z]:/.test(initialPath)
      const defaultPath = isRelative ? path.join(games_folder, initialPath) : path.resolve(initialPath)
      // prompt for picking file or folder
      const [filePath] = dialog.showOpenDialogSync(mainWindow!, {
        properties: [dialogType, 'dontAddToRecent'],
        defaultPath,
        title,
      }) || []
      // if path is relative to initialPath and doesn't backstep, return relative. otherwise, don't
      if (!filePath) event.returnValue = filePath
      else {
        const relativePath = path.relative(initialPath, filePath)
        event.returnValue = relativePath.startsWith('..') ? filePath : (relativePath || '.')
      }
    })

    ipcMain.on('show-message-dialog', (event, title: string, message: string, type: MessageBoxSyncOptions['type']='none', buttons: MessageBoxSyncOptions['buttons']=[], defaultBtnIdx=0) => {
      const res = dialog.showMessageBoxSync(mainWindow!, {
        title,
        message,
        type,
        buttons,
        defaultId: defaultBtnIdx,
        noLink: true,
      })
      event.returnValue = res
    })

  })
  .catch(console.log);
