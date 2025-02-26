/* eslint-disable import/no-relative-packages */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable no-console */
import { spawn, exec } from 'child_process'
import fs from 'fs'
import ini from 'ini'
import Path from 'path'
import { Router } from 'express'

import { ConfigType, MissingGamesType, StringMap } from '../../types'


const router = Router()


let config: ConfigType
type FileTypesType = {[key: string]: string[]}
function getConfig() {
  return new Promise<ConfigType>((resolve, reject) => {
    fs.readFile(Path.join(__dirname, '../../../config.ini'), 'utf-8', (err, data) => {
      if (err) {
        reject({status: 404, message: err})
      } else {
        const rawConfig: StringMap = ini.parse(data)
        const file_types = Object.entries(rawConfig.File_Types).reduce((acc: FileTypesType, [key, val]) => {
          acc[key] = val.split(',').map(v => v.trim())
          return acc
        }, {})
        const ignored_exes = Object.keys(rawConfig.Ignored_Exes).map(k => k.trim())
        const {games_folder, locale_emulator} = Object.entries(rawConfig.DEFAULT).reduce((acc: StringMap, [key, val]) => {
          acc[key] = val.trim().replaceAll('\\', '/')
          return acc
        }, {})
        resolve({games_folder, locale_emulator, file_types, ignored_exes})
      }
    })
  })
}
getConfig()
  .then(cfg => {
    config = cfg
    // console.log(config)
  })
  .catch(err => {
    console.error(err)
  })

router.post('/open/:type', (req, res, next) => {
  const { type } = req.params
  const { path, useLE } = req.body

  const run = (filepath: string, args: string[] = []) => {
    const workingdir = Path.dirname(filepath)
    const relativePath = Path.relative(workingdir, filepath)
    let command = ''
    if (useLE && /(swf|exe|jar)$/.test(relativePath)) {
      command = `Start-Process \\"${config.locale_emulator}\\" -ArgumentList \\"${relativePath}\\"`
    } else {
      command = `Start-Process \\"${relativePath}\\" ${args.length ? `-ArgumentList \\"${args.join('\\",\\"')}\\"` : ''}`
    }
    const process = spawn('powershell.exe', ['-command', command], {
      detached: true,
      stdio: 'ignore',
      cwd: workingdir,
      shell: true,
    })
    process.on('error', err => {
      console.error(`Failed to start process "${filepath}": ${err}`)
      next({message: `Failed to start process "${filepath}": ${err}`})
    })
    process.on('exit', () => {
      res.status(200).json({'message': 'started game'})
    })
    process.unref()
  }

  const { games_folder } = config
  if (type === 'game') {
    const filepath = (process.env.SHOWCASING || process.env.NODE_ENV === 'showcasing') ?
      'notepad'
      : Path.join(games_folder, path)
    console.log(filepath)
    if (fs.existsSync(filepath) || filepath === 'notepad') {
      run(filepath)
    } else {
      next({status: 404, message: `file ${filepath} does not exist`})
    }
  } else if (type === 'webpage') {
    exec(`start "" "${path}"`, (err) => {
      if (err) {
        next({message: `Failed to start url "${path}": ${err}`})
      }
    })
  } else if (type === 'folder') {
    const filepath = Path.resolve(path)
    if (fs.existsSync(filepath)) run("explorer.exe", [filepath])
      else run('explorer.exe', [games_folder])
  } else if (type === 'openatfile') {
    const filepath = Path.resolve(path)
    if (fs.existsSync(filepath)) run("explorer.exe", ['/select,', `\`\\"${filepath}\`\\"`])
    else run('explorer.exe', [games_folder])
  }
})

router.get('/config', (req, res, next) => {
  getConfig()
  .then(cfg => {
    config = cfg
    res.status(200).json(config)
  })
  .catch(err => {
    next(err)
  })
})

router.put('/config', (req, res, next) => {
  const {games_folder: new_gfol, locale_emulator: new_le, ignored_exes: new_ignexe, file_types: new_filetypes}: {
    games_folder: string
    locale_emulator: string
    ignored_exes: string[]
    file_types: FileTypesType
  } = req.body
  const { games_folder, locale_emulator, ignored_exes, file_types } = config

  const DEFAULT = {
    games_folder: new_gfol || games_folder,
    locale_emulator: new_le || locale_emulator
  }
  const File_Types = {...file_types, ...new_filetypes}
  let Ignored_Exes = {}
  if (new_ignexe) {
    Ignored_Exes = new_ignexe.reduce((acc: {[key: string]: boolean}, cur) => {
      acc[cur] = true
      return acc
    }, {})
  } else {
    Ignored_Exes = ignored_exes.reduce((acc: {[key: string]: boolean}, cur) => {
      acc[cur] = true
      return acc
    }, {})
  }

  const iniString = ini.stringify({DEFAULT, File_Types, Ignored_Exes}).replaceAll('=true', '')

  fs.writeFile(Path.join(__dirname, '../../../config.ini'), iniString, (err) => {
    if (err) {
      next({status: 400, message: err})
    } else {
      res.status(200).json({message: 'INI successfully updated'})
    }
  })
})

router.post('/urlupdates', (req, res, next) => {
  async function getRedirectedUrl(url: string) {
    const response = await fetch(url, {
      method: 'HEAD', // Use HEAD to fetch headers only
      redirect: 'follow' // Follow redirects
    });

    // Check if the response is a redirect
    if (response.redirected) {
      return response.url; // This will give you the final URL after redirects
    } else {
      return url; // If no redirect, return the original URL
    }
  }
  const {checkUrl} = req.body
  getRedirectedUrl(checkUrl)
    .then(redirectedUrl => {
      res.status(200).json({message: checkUrl !== redirectedUrl ? 'updated' : 'no update', redirectedUrl})
    })
    .catch(next)
})

/**
 * @typedef {Object} Game
 * @property {number} game_id - The game's ID from the database
 * @property {string} path - The path to the game (relative)
 */
router.post('/missinggames', (req, res) => {
  const {games}: {games: MissingGamesType} = req.body
  // check for missing games
  const missingGames = games.filter(({path}) => {
    const gamefol = Path.join(config.games_folder, path)
    return !fs.existsSync(gamefol)
  })
  res.status(200).json(missingGames)
})


module.exports = router
