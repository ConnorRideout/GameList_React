import { dialog, MessageBoxSyncOptions, IpcMainEvent, BrowserWindow, app } from 'electron'
import axios from 'axios'

import Path from '../parsedPath'

import { SettingsType } from '../types'


// get settings data
// let games_folder = __dirname
// let file_types: SettingsType['file_types']
async function getSettings() {
  try {
    const { data } = await axios.get('http://localhost:9000/settings')
    const {games_folder, file_types} = data as Pick<SettingsType, 'games_folder' | 'file_types'>
    return {games_folder, file_types}
  } catch (err) {
    console.error(err)
    return {games_folder: __dirname, file_types: {Images: [], Executables: []}}
  }
}


export async function openDialog(
  event: IpcMainEvent,
  mainWindow: BrowserWindow,
  title=undefined,
  dialogType: 'openFile' | 'openDirectory' = 'openFile',
  initialPath: string = '',
  extension_filters: 'executables' | 'images' | 'any' = 'any'
) {
  const {games_folder, file_types} = await getSettings()

  // if it's a full path, use initialPath, otherwise join it to games_folder
  let defaultPath: string
  let initPath: Path

  if (initialPath === 'documents') {
    defaultPath = app.getPath('documents')
    initPath = new Path(defaultPath)
  } else if (!initialPath && extension_filters === 'images') {
    initPath = new Path(
      __dirname,
      '../../src/backend/data',
      process.env.SHOWCASING ? 'showcase/gameImages' : 'development/gameImages'
    )
    defaultPath = initPath.path
  } else {
    const isRelative = !/^[A-Z]:/.test(initialPath)
    initPath = (isRelative ? new Path(games_folder, initialPath) : new Path(initialPath || games_folder))
    defaultPath = initPath.path
  }
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
  if (!filePath || initialPath === 'documents') event.returnValue = filePath
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
