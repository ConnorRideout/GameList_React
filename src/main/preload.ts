// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, MessageBoxSyncOptions } from 'electron';

import { ContextMenuTemplate, MenuAction } from '../types';

export type Channels = 'ipc-example';

/** Opens a syncronous Electron dialog to select files or folders
 * @param title - The title of the dialog (default is dialogTypes's default)
 * @param dialogType - The type of dialog (default is 'openFile')
 * @param initialPath - What folder to open the select dialog to (default is the games_folder in settings)
 * @param extension_filters - If `dialogType` is 'openFile', which type of extensions to allow (default is 'any')
 * @returns The string path that was selected (relative to initialPath if possible without backstepping) or undefined if dialog was canceled
 */
const openFileDialog = ({
  title,
  dialogType,
  initialPath,
  extension_filters
}: {
  title?: string,
  dialogType?: 'openFile' | 'openDirectory',
  initialPath?: string
  extension_filters?: 'executables' | 'images' | 'all'
}): string | undefined => (
  ipcRenderer.sendSync('open-file-dialog', title, dialogType, initialPath, extension_filters)
)

/** Opens a syncronous Electron dialog that shows information and optionally gets basic user input
 * @param title - The title of the dialog
 * @param message - The text content of the messagebox
 * @param type - The messagebox type (default is 'none')
 * @param buttons - An array of texts for buttons (default is [] which just shows 'OK')
 * @param defaultBtnIdx - Index of the button in the buttons array which will be selected by default when the message box opens
 * @returns The index of the clicked button
 */
const showMessageBox = ({
  title,
  message,
  type,
  buttons,
  defaultBtnIdx
}: {
  title: string,
  message: string,
  type?: MessageBoxSyncOptions['type'],
  buttons?: MessageBoxSyncOptions['buttons'],
  defaultBtnIdx?: number
}): number => (
  ipcRenderer.sendSync('show-message-dialog', title, message, type, buttons, defaultBtnIdx)
)

/**
 *
 * @param args.x - The x position of the context menu
 * @param args.y - The y position of the context menu
 * @param args.customTemplates - An array of items to show in the context menu
 * @param args.customTemplates.label - The text to show on the context menu
 * @param args.customTemplates.trigger - The ipcRenderer trigger that will be sent
 * @param args.customTemplates.target - In case `customTemplates.trigger` isn't specific enough, this will allow more specificity
 * @returns Void; if the user clicks a content menu item it will send the signal defined in the customTemplate (with target, if defined)
 */
const showCustomContextMenu = ({
  x,
  y,
  customTemplates
}: {
  x: number,
  y: number,
  customTemplates: ContextMenuTemplate[]
}) => (
  ipcRenderer.send('show-custom-context-menu', x, y, customTemplates)
)

const onContextMenuAction = (callback: (trigger: string, target: string | number) => void) => {
  const listener = (event: IpcRendererEvent, trigger: string, target: string | number) => {
    callback(trigger, target)
  }

  ipcRenderer.on('context-menu-action', listener)

  return () => {
    ipcRenderer.removeListener('context-menu-action', listener)
  }
}



const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },

  onMenuAction: (callback: (action: MenuAction) => void) => {
    ipcRenderer.on('menu-action', (event, action: MenuAction) => callback(action))
  },

  openFileDialog,
  showMessageBox,
  showCustomContextMenu,
  onContextMenuAction,
};

contextBridge.exposeInMainWorld('electron', electronHandler)

export type ElectronHandler = typeof electronHandler;
