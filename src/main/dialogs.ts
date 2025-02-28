import { dialog, MessageBoxSyncOptions, IpcMainEvent, BrowserWindow } from 'electron'
import axios from 'axios'

import Path from '../parsedPath'

import { SettingsType } from '../types'


// get settings data
let games_folder = __dirname
let file_types: SettingsType['file_types']
axios.get('http://localhost:9000/settings')
  .then(({data}) => {
    games_folder = data.games_folder
    file_types = data.file_types
  })
  .catch(err => console.error(err))


export function openDialog(
      event: IpcMainEvent,
      mainWindow: BrowserWindow,
      title=undefined,
      dialogType: 'openFile' | 'openDirectory' = 'openFile',
      initialPath: string = games_folder,
      extension_filters: 'executables' | 'images' | 'any' = 'any'
    ) {
      // if it's a full path, use initialPath, otherwise join it to games_folder
      const isRelative = !/^[A-Z]:/.test(initialPath)
      const initPath = (isRelative ? new Path(games_folder, initialPath) : new Path(initialPath))
      const defaultPath = initPath.path
      // get filters for dialog
      let filters: {
        name: string;
        extensions: string[];
      }[] | undefined
      if (dialogType === 'openFile') {
        filters = []
        if (extension_filters === 'executables') {
          filters.push({
            name: `Executables (${file_types.Executables.map(e => `*.${e}`).join(', ')})`,
            extensions: file_types.Executables
          })
        }
        else if (extension_filters === 'images') {
          filters.push({
            name: `Images (${file_types.Images.map(e => `*.${e}`).join(', ')})`,
            extensions: file_types.Images
          })
        }
        filters.push({ name: 'All Files', extensions: ['*'] })
      }
      // prompt for picking file or folder
      const [filePath] = dialog.showOpenDialogSync(mainWindow, {
        properties: [dialogType, 'dontAddToRecent'],
        defaultPath,
        title,
        filters,
      }) || [] // dialog returns undefined if it's closed, do in order to destructure assign filePath, need to return an empty array
      // if path is relative to initialPath and doesn't backstep, return relative. otherwise, don't
      if (!filePath) event.returnValue = filePath
      else {
        const relativePath = initPath.relative(filePath)
        event.returnValue = relativePath.startsWith('..') ? filePath : (relativePath || '.')
      }
    }

export function messageBox(
  event: IpcMainEvent,
  mainWindow: BrowserWindow,
  title: string='',
  message: string='',
  type: MessageBoxSyncOptions['type'] = 'none',
  buttons: MessageBoxSyncOptions['buttons'] = [],
  defaultBtnIdx: number = 0
) {
  const res = dialog.showMessageBoxSync(mainWindow, {
    title,
    message,
    type,
    buttons,
    defaultId: defaultBtnIdx,
    noLink: true,
  })
  event.returnValue = res
}
