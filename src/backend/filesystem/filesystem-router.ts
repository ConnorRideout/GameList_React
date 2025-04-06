/* eslint-disable import/no-relative-packages */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable no-console */
import { exec } from 'child_process'
import { Router } from 'express'
import axios from 'axios'
import Fuse from 'fuse.js'

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

  const run = (filepath: Path | 'notepad' | 'explorer.exe' | 'start', args: string = '') => {
    let command = ''

    if (filepath instanceof Path) {
      const workingdir = filepath.dirname
      const relativePath = new Path(workingdir).relative(filepath)

      const nircmd = new Path(__dirname, '../../../', 'nircmd-x64.exe')

      let commandArgs = ''
      if (/(swf|exe|jar)$/.test(relativePath)) {
        if (useLE) {
          commandArgs = `"${settings.locale_emulator}" "${relativePath}"`
        } else {
          commandArgs = `"${filepath.path}"`
        }
        command = `"${nircmd.path}" exec2 show "${workingdir}" ${commandArgs}`
      } else {
        command = `"${nircmd.path}" shexec "open" "${filepath.path}"`
      }
    } else {
      command = `${filepath} ${args}`
    }
    console.log(command)

    exec(command)
  }

  const { games_folder } = settings
  if (type === 'game') {
    const filepath = (process.env.SHOWCASING || process.env.NODE_ENV === 'showcasing')
      ? 'notepad'
      : new Path(games_folder, path)
    if (filepath === 'notepad' || filepath.existsSync()) {
      run(filepath)
    } else {
      next({ status: 404, message: `file ${filepath.path} does not exist` })
    }
  } else if (type === 'webpage') {
    run('start', `"" "${path}"`)
  } else if (type === 'folder') {
    const filepath = new Path(path)
    if (filepath.existsSync())
      run("explorer.exe", `"${filepath.path}"`)
    else
      run("explorer.exe", `"${games_folder}"`)
  } else if (type === 'openatfile') {
    const filepath = new Path(path)
    if (filepath.existsSync())
      run("explorer.exe", `/select, "${filepath.path}"`)
    else
      run('explorer.exe', `"${games_folder}"`)
  }
})

async function getNewGames(settings: SettingsType) {
  // get games dir
  const games_dir = new Path(settings.games_folder)
  // parse existing games
  const rawExistingGames: { [path: string]: string }[] = await getGamePaths()
  const existingGames = rawExistingGames.map(p => games_dir.join(p.path).path)
  // find folders that aren't in existing games
  const newGames: string[] = []
  const paths = await games_dir.getPathsNLevelsAway(1, false)
  paths.forEach(pth => {
    if (pth.stem[0] === '_')
      return
    if (pth.isFileSync() && !settings.file_types.Executables.includes(pth.ext.replace(/^\./, '')))
      return
    if (existingGames.includes(pth.path))
      return
    newGames.push(games_dir.relative(pth.path))
  })
  return newGames
}

router.get('/newgames', async (req, res, next) => {
  const settings = await getSettings()
  getNewGames(settings)
    .then(newGames => {
      res.status(200).json(newGames)
    })
    .catch(next)
})

router.post('/missinggames', async (req, res, next) => {
  try {
    const settings = await getSettings()
    const games_folder = new Path(settings.games_folder)
    // get games that should be checked against, i.e. ones that don't already have a pointer
    const unreferenced_games = (await getNewGames(settings)).map(basename => ({basename}))
    const fuzzy = new Fuse(unreferenced_games, {keys: ['basename']})
    const { games }: { games: MissingGamesType } = req.body
    // check for missing games
    const missingGames = games.filter(({ path }) => {
      const gamefol = games_folder.join(path)
      return !gamefol.existsSync()
    })
      .map(missing => {
        const fuzzy_search_title = fuzzy.search(missing.title)[0]
        const fuzzy_search_path = fuzzy.search(missing.path)[0]
        if (!fuzzy_search_title) {
          missing.possible_new_path = fuzzy_search_path?.item.basename
        } else if (!fuzzy_search_path) {
          missing.possible_new_path = fuzzy_search_title?.item.basename
        } else {
          const match_score_title = fuzzy_search_title.score!
          const match_score_path = fuzzy_search_path.score!
          if (match_score_path < match_score_title) {
            missing.possible_new_path = fuzzy_search_path.item.basename
          } else {
            missing.possible_new_path = fuzzy_search_title.item.basename
          }
        }
        return missing
      })
    res.status(200).json(missingGames)
  } catch (error) {
    next(error)
  }
})

router.delete('/file', (req, res, next) => {
  try {
    const { file } = req.body
    const filePath = new Path(file)
    filePath.removeSync()
    res.status(200).json({message: `deleted file "${file}"`})
  } catch (error) {
    next({ message: error })
  }
})

router.post('/getexecutables', async (req, res, next) => {
  try {
    const settings = await getSettings()

    const { top_path, existing_paths }: { top_path: string, existing_paths: string[] } = req.body
    const parent_path = new Path(settings.games_folder, top_path)
    // get new paths
    const file_extensions = settings.file_types.Executables.map(ext => ext.toLowerCase())
    const regex_tests = settings.ignored_exes.map(re_str => new RegExp(re_str))

    const getFilepathsNLevelsAway = async (n: number) => {
      const all_filepaths = await parent_path.getPathsNLevelsAway(n, false, { onlyFiles: true })
      const valid_files = all_filepaths.filter(p => {
        if (!file_extensions.includes(p.ext.toLowerCase().slice(1)))
          return false
        // eslint-disable-next-line no-restricted-syntax
        for (const re of regex_tests) {
          if (re.test(p.basename))
            return false
        }
        return true
      })
      const valid_filepaths = valid_files.map(p => parent_path.relative(p))
      return valid_filepaths
    }

    let filepaths = await getFilepathsNLevelsAway(1)
    if (!filepaths.length) {
      filepaths = await getFilepathsNLevelsAway(2)
    }
    if (!filepaths.length) {
      filepaths = await getFilepathsNLevelsAway(3)
    }

    // check existing paths, and if they still exist, insert them in the same order where they previously were
    existing_paths.forEach((str_path, idx) => {
      const pth = parent_path.join(str_path)
      const relative_pth = parent_path.relative(pth)
      if (pth.existsSync()) {
        if (!filepaths.includes(relative_pth)) {
          if (filepaths.length > idx)
            filepaths.splice(idx, 0, relative_pth)
          else
            filepaths.push(relative_pth)
        } else if (filepaths.indexOf(str_path) !== idx) {
          filepaths.splice(filepaths.indexOf(str_path), 1)
          if (filepaths.length > idx)
            filepaths.splice(idx, 0, relative_pth)
          else
            filepaths.push(relative_pth)
        }
      }
    })

    res.status(200).json({
      filepaths
    })
  } catch (error) {
    next({message: error})
  }
})


module.exports = router
