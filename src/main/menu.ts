import {
  // app,
  Menu,
  // shell,
  BrowserWindow,
  MenuItemConstructorOptions,
} from 'electron';
import { ContextMenuTemplate } from '../types';

// interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
//   selector?: string;
//   submenu?: DarwinMenuItemConstructorOptions[] | Menu;
// }

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu(): Menu {
    // context menu
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props
      const contextTemplate = this.buildDefaultContextTemplate(x, y)

      Menu.buildFromTemplate(contextTemplate).popup({ window: this.mainWindow });
    });
    // if (
    //   process.env.NODE_ENV === 'development' ||
    //   process.env.DEBUG_PROD === 'true'
    // ) {
    //   this.setupDevelopmentEnvironment(contextTemplate);
    // }

    const template = this.buildDefaultTemplate();
    // const template =
    //   process.platform === 'darwin'
    //     ? this.buildDarwinTemplate()
    //     : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  // Context Menu
  sendContextMenuTrigger(trigger: string, target?: string | number) {
    this.mainWindow.webContents.send('context-menu-action', trigger, target)
  }

  buildDefaultContextTemplate(x: number, y: number) {
    const templateDefault = [
      // {
      //   label: 'Do something',
      //   click: () => {
      //     this.sendContextMenuTrigger('DO-SOMETHING')
      //   },
      // },
    ]
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      templateDefault.push({
        label: 'Inspect element',
        click: () => {
          this.mainWindow.webContents.inspectElement(x, y)
        },
      })
    }

    return templateDefault
  }

  buildCustomMenu(x: number, y: number, customTemplates: ContextMenuTemplate[]) {
    const templateDefault = this.buildDefaultContextTemplate(x, y)
    const template = customTemplates.map(({label, trigger, target}) => ({
      label,
      click: () => {
        this.sendContextMenuTrigger(trigger, target)
      }
    }))
    Menu.buildFromTemplate([...templateDefault, ...template]).popup({ window: this.mainWindow })
  }

  // setupDevelopmentEnvironment(contextTemplate: MenuItemConstructorOptions[]): void {
  //   this.mainWindow.webContents.on('context-menu', (_, props) => {
  //     const { x, y } = props;

  //     Menu.buildFromTemplate([
  //       {
  //         label: 'Inspect element',
  //         click: () => {
  //           this.mainWindow.webContents.inspectElement(x, y);
  //         },
  //       },
  //       ...contextTemplate
  //     ]).popup({ window: this.mainWindow });
  //   });
  // }



  // Menu Bar
  sendMenuTrigger(type: string) {
    this.mainWindow.webContents.send('menu-action', {type})
  }

  buildDefaultTemplate() {
    // const exampleTemplateDefault = [
    //   {
    //     label: '&File',
    //     submenu: [
    //       {
    //         label: '&Open',
    //         accelerator: 'Ctrl+O',
    //       },
    //       {
    //         label: '&Close',
    //         accelerator: 'Ctrl+W',
    //         click: () => {
    //           this.mainWindow.close();
    //         },
    //       },
    //     ],
    //   },
    //   {
    //     label: '&View',
    //     submenu:
    //       process.env.NODE_ENV === 'development' ||
    //       process.env.DEBUG_PROD === 'true'
    //         ? [
    //             {
    //               label: '&Reload',
    //               accelerator: 'Ctrl+R',
    //               click: () => {
    //                 this.mainWindow.webContents.reload();
    //               },
    //             },
    //             {
    //               label: 'Toggle &Full Screen',
    //               accelerator: 'F11',
    //               click: () => {
    //                 this.mainWindow.setFullScreen(
    //                   !this.mainWindow.isFullScreen(),
    //                 );
    //               },
    //             },
    //             {
    //               label: 'Toggle &Developer Tools',
    //               accelerator: 'Alt+Ctrl+I',
    //               click: () => {
    //                 this.mainWindow.webContents.toggleDevTools();
    //               },
    //             },
    //           ]
    //         : [
    //             {
    //               label: 'Toggle &Full Screen',
    //               accelerator: 'F11',
    //               click: () => {
    //                 this.mainWindow.setFullScreen(
    //                   !this.mainWindow.isFullScreen(),
    //                 );
    //               },
    //             },
    //           ],
    //   },
    //   {
    //     label: 'Help',
    //     submenu: [
    //       {
    //         label: 'Learn More',
    //         click() {
    //           shell.openExternal('https://electronjs.org');
    //         },
    //       },
    //       {
    //         label: 'Documentation',
    //         click() {
    //           shell.openExternal(
    //             'https://github.com/electron/electron/tree/main/docs#readme',
    //           );
    //         },
    //       },
    //       {
    //         label: 'Community Discussions',
    //         click() {
    //           shell.openExternal('https://www.electronjs.org/community');
    //         },
    //       },
    //       {
    //         label: 'Search Issues',
    //         click() {
    //           shell.openExternal('https://github.com/electron/electron/issues');
    //         },
    //       },
    //     ],
    //   },
    // ];

    /* the menu actions are handled in App.tsx. The trigger types are defined in the types file */
    const templateDefault: MenuItemConstructorOptions[] = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open Games Folder',
            accelerator: 'Ctrl+O',
            click: () => {
              this.sendMenuTrigger('OPEN_GAMES_FOLDER')
            }
          },
          {
            label: '&Settings',
            accelerator: 'Ctrl+S',
            click: () => {
              this.sendMenuTrigger('OPEN_SETTINGS');
            },
          },
          {
            label: '&Dislike Notes',
            accelerator: 'Ctrl+D',
            click: () => {
              this.sendMenuTrigger('OPEN_DISLIKE_NOTES')
            }
          },
        ],
      },
      {
        label: '&Edit',
        submenu: [
          {
            label: 'Check for &NEW Games',
            accelerator: 'Ctrl+N',
            click: () => {
              this.sendMenuTrigger('CHECK_NEW')
            }
          },
          {
            label: 'Check for &MISSING Games',
            accelerator: 'Ctrl+M',
            click: () => {
              this.sendMenuTrigger('CHECK_MISSING')
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Check for &UPDATED Games',
            accelerator: 'Ctrl+U',
            click: () => {
              this.sendMenuTrigger('CHECK_UPDATED')
            }
          }
        ]
      }
    ]

    return templateDefault;
  }

  // buildDarwinTemplate(): MenuItemConstructorOptions[] {
  //   const subMenuAbout: DarwinMenuItemConstructorOptions = {
  //     label: 'Electron',
  //     submenu: [
  //       {
  //         label: 'About ElectronReact',
  //         selector: 'orderFrontStandardAboutPanel:',
  //       },
  //       { type: 'separator' },
  //       { label: 'Services', submenu: [] },
  //       { type: 'separator' },
  //       {
  //         label: 'Hide ElectronReact',
  //         accelerator: 'Command+H',
  //         selector: 'hide:',
  //       },
  //       {
  //         label: 'Hide Others',
  //         accelerator: 'Command+Shift+H',
  //         selector: 'hideOtherApplications:',
  //       },
  //       { label: 'Show All', selector: 'unhideAllApplications:' },
  //       { type: 'separator' },
  //       {
  //         label: 'Quit',
  //         accelerator: 'Command+Q',
  //         click: () => {
  //           app.quit();
  //         },
  //       },
  //     ],
  //   };
  //   const subMenuEdit: DarwinMenuItemConstructorOptions = {
  //     label: 'Edit',
  //     submenu: [
  //       { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
  //       { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
  //       { type: 'separator' },
  //       { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
  //       { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
  //       { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
  //       {
  //         label: 'Select All',
  //         accelerator: 'Command+A',
  //         selector: 'selectAll:',
  //       },
  //     ],
  //   };
  //   const subMenuViewDev: MenuItemConstructorOptions = {
  //     label: 'View',
  //     submenu: [
  //       {
  //         label: 'Reload',
  //         accelerator: 'Command+R',
  //         click: () => {
  //           this.mainWindow.webContents.reload();
  //         },
  //       },
  //       {
  //         label: 'Toggle Full Screen',
  //         accelerator: 'Ctrl+Command+F',
  //         click: () => {
  //           this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
  //         },
  //       },
  //       {
  //         label: 'Toggle Developer Tools',
  //         accelerator: 'Alt+Command+I',
  //         click: () => {
  //           this.mainWindow.webContents.toggleDevTools();
  //         },
  //       },
  //     ],
  //   };
  //   const subMenuViewProd: MenuItemConstructorOptions = {
  //     label: 'View',
  //     submenu: [
  //       {
  //         label: 'Toggle Full Screen',
  //         accelerator: 'Ctrl+Command+F',
  //         click: () => {
  //           this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
  //         },
  //       },
  //     ],
  //   };
  //   const subMenuWindow: DarwinMenuItemConstructorOptions = {
  //     label: 'Window',
  //     submenu: [
  //       {
  //         label: 'Minimize',
  //         accelerator: 'Command+M',
  //         selector: 'performMiniaturize:',
  //       },
  //       { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
  //       { type: 'separator' },
  //       { label: 'Bring All to Front', selector: 'arrangeInFront:' },
  //     ],
  //   };
  //   const subMenuHelp: MenuItemConstructorOptions = {
  //     label: 'Help',
  //     submenu: [
  //       {
  //         label: 'Learn More',
  //         click() {
  //           shell.openExternal('https://electronjs.org');
  //         },
  //       },
  //       {
  //         label: 'Documentation',
  //         click() {
  //           shell.openExternal(
  //             'https://github.com/electron/electron/tree/main/docs#readme',
  //           );
  //         },
  //       },
  //       {
  //         label: 'Community Discussions',
  //         click() {
  //           shell.openExternal('https://www.electronjs.org/community');
  //         },
  //       },
  //       {
  //         label: 'Search Issues',
  //         click() {
  //           shell.openExternal('https://github.com/electron/electron/issues');
  //         },
  //       },
  //     ],
  //   };

  //   const subMenuView =
  //     process.env.NODE_ENV === 'development' ||
  //     process.env.DEBUG_PROD === 'true'
  //       ? subMenuViewDev
  //       : subMenuViewProd;

  //   return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  // }
}
