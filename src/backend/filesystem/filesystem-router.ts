/* eslint-disable import/no-relative-packages */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable no-console */
import { exec } from 'child_process'
import { Router } from 'express'
import axios from 'axios'

import Path from '../../parsedPath'
import { getGamePaths } from '../games/games-model'

import { SettingsType, MissingGamesType } from '../../types'


const router = Router()


async function getSettings(): Promise<SettingsType> {
  const res = await axios.get('http://localhost:9000/settings')
  return res.data
}

router.post('/open/:type', async (req, res, next) => {
  const settings = await getSettings()
  const { type } = req.params
  const { path, useLE } = req.body

  const run = (filepath: Path, args: string[] = []) => {
    const workingdir = filepath.dirname
    const relativePath = new Path(workingdir).relative(filepath)

    const nircmd = new Path(__dirname, '../../../', 'nircmd-x64.exe')

    let commandArgs = ''
    let command = ''
    if (/(swf|exe|jar)$/.test(relativePath)) {
      if (useLE) {
        commandArgs = `"${settings.locale_emulator}" "${relativePath}"`
      } else {
        commandArgs = `"${filepath.path}" ${args.length ? `"${args.join('" "')}"` : ''}`
      }
      command = `"${nircmd.path}" exec2 show "${workingdir}" ${commandArgs}`
    } else {
      command = `"${nircmd.path}" shexec "open" "${filepath.path}"`
    }
    console.log(command)

    const process = exec(command, (err) => {
      if (err) {
        next({ message: `Failed to start url "${path}": ${err}` })
      }
    })

    process.on('error', err => {
      console.error(`Failed to start process "${filepath}": ${err}`)
      next({ message: `Failed to start process "${filepath}": ${err}` })
    })
    process.on('exit', () => {
      res.status(200).json({ 'message': 'started game' })
    })
    process.unref()
  }

  const { games_folder } = settings
  if (type === 'game') {
    const filepath = (process.env.SHOWCASING || process.env.NODE_ENV === 'showcasing')
      ? new Path('notepad')
      : new Path(games_folder, path)
    if (filepath.path === 'notepad' || filepath.existsSync()) {
      // if (filepath === 'notepad' || fs.existsSync(filepath)) {
      run(filepath)
    } else {
      next({ status: 404, message: `file ${filepath.path} does not exist` })
      // next({status: 404, message: `file ${filepath} does not exist`})
    }
  } else if (type === 'webpage') {
    exec(`start "" "${path}"`, (err) => {
      if (err) {
        next({ message: `Failed to start url "${path}": ${err}` })
      }
    })
  } else if (type === 'folder') {
    const filepath = new Path(path)
    if (filepath.existsSync()) run(new Path("explorer.exe"), [filepath.path])
    else run(new Path("explorer.exe"), [games_folder])
  } else if (type === 'openatfile') {
    const filepath = new Path(path)
    if (filepath.existsSync()) run(new Path("explorer.exe"), ['/select,', `\`\\"${filepath.path}\`\\"`])
    else run(new Path('explorer.exe'), [games_folder])
  }
})

router.post('/missinggames', async (req, res) => {
  const settings = await getSettings()
  const { games }: { games: MissingGamesType } = req.body
  // check for missing games
  const missingGames = games.filter(({ path }) => {
    const gamefol = new Path(settings.games_folder, path)
    return !gamefol.existsSync()
  })
  res.status(200).json(missingGames)
})

router.get('/newgames', async (req, res, next) => {
  const settings = await getSettings()
  // get games dir
  const games_dir = new Path(settings.games_folder)
  // parse existing games
  const rawExistingGames: { [path: string]: string }[] = await getGamePaths()
  const existingGames = rawExistingGames.map(p => games_dir.join(p.path).path)
  // find folders that aren't in existing games
  const newGames: string[] = []
  games_dir.getPathsNLevelsAway(1, false)
    .then(paths => {
      paths.forEach(pth => {
        if (pth.stem[0] === '_')
          return
        if (pth.isFileSync() && !settings.file_types.Executables.includes(pth.ext.replace(/^\./, '')))
          return
        if (existingGames.includes(pth.path))
          return
        newGames.push(games_dir.relative(pth.path))
      })
      res.status(200).json(newGames)
    })
    .catch(next)
})

router.post('/deletefile', (req, res, next) => {
  try {
    const { file } = req.body
    const filePath = new Path(file)
    filePath.removeSync()
  } catch (error) {
    next({ message: error })
  }
})


module.exports = router
