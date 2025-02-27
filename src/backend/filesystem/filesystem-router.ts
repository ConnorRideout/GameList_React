/* eslint-disable import/no-relative-packages */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable no-console */
import { spawn, exec } from 'child_process'
import fs from 'fs'
// import ini from 'ini'
import Path from 'path'
import { Router } from 'express'
import axios from 'axios'

import { SettingsType, MissingGamesType } from '../../types'


const router = Router()


let settings: SettingsType
async function getSettings() {
  const res = await axios.get('http://localhost:9000/settings')
  return res.data
}
getSettings()
  .then(set => {
    settings = (set as any)
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
      command = `Start-Process \\"${settings.locale_emulator}\\" -ArgumentList \\"${relativePath}\\"`
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

  const { games_folder } = settings
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
    const gamefol = Path.join(settings.games_folder, path)
    return !fs.existsSync(gamefol)
  })
  res.status(200).json(missingGames)
})


module.exports = router
