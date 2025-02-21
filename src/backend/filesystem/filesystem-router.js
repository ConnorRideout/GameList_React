/* eslint-disable no-console */
const router = require('express').Router()
const { spawn } = require('child_process')
const fs = require('fs')
const ini = require('ini')
const Path = require('path')

let config = {}

router.post('/open/:type', (req, res, next) => {
  const { type } = req.params
  const { path, useLE } = req.body

  const run = (filepath, isEroge=false) => {
    const workingdir = Path.dirname(filepath)
    const relativePath = Path.relative(workingdir, filepath)
    let command = ''
    if (isEroge && /(swf|exe|jar)$/.test(relativePath)) {
      command = `Start-Process \\"${config.locale_emulator}\\" -ArgumentList \\"${relativePath}\\"`
    } else {
      command = `Start-Process \\"${relativePath}\\"`
    }
    const process = spawn('powershell.exe', ['-command', command], {
      detached: true,
      stdio: 'ignore',
      cwd: workingdir,
      shell: true
    })
    process.on('error', err => {
      console.error(`Failed to start process "${filepath}": ${err}`)
      next({message: `Failed to start process "${filepath}": ${err}`})
    })
    process.unref()
  }

  if (type === 'game') {
    const { games_folder } = config
    const filepath = (process.env.SHOWCASING || process.env.NODE_ENV === 'showcasing') ?
      'notepad'
      : Path.join(games_folder, path)
    console.log(filepath)
    if (fs.existsSync(filepath) || filepath === 'notepad') {
      run(filepath, useLE)
    } else {
      next({status: 404, message: `file ${filepath} does not exist`})
    }
  } else if (type === 'webpage') {
    run(path)
  } else if (type === 'folder') {
    const filepath = Path.resolve(path)
    if (fs.existsSync(filepath)) run("explorer.exe", `"${filepath}"`)
      else run(`explorer.exe "${__dirname}"`)
  } else if (type === 'openatfile') {
    const filepath = Path.resolve(path)
    if (fs.existsSync(filepath)) run("explorer.exe", `/select "${filepath}"`)
    else run(`explorer.exe "${__dirname}"`)
  }
})

router.get('/config', (req, res, next) => {
  fs.readFile(Path.join(__dirname, '../../../config.ini'), 'utf-8', (err, data) => {
    if (err) {
      next({status: 404, message: err})
    } else {
      const rawConfig = ini.parse(data)
      const ignored_exes = Object.keys(rawConfig.Ignored_Exes).map(k => k.trim())
      config = Object.entries(rawConfig.DEFAULT).reduce((acc, [key, val]) => {
        acc[key] = val.trim().replaceAll('\\', '/')
        return acc
      }, {ignored_exes})
      res.status(200).json(config)
    }
  })
})

router.put('/config', (req, res, next) => {
  const {games_folder: new_gfol, locale_emulator: new_le, ignored_exes: new_ignexe} = req.body
  const { games_folder, locale_emulator, ignored_exes } = config

  const DEFAULT = {
    games_folder: new_gfol || games_folder,
    locale_emulator: new_le || locale_emulator
  }
  let Ignored_Exes = {}
  if (new_ignexe) {
    Ignored_Exes = new_ignexe.reduce((acc, cur) => {
      acc[cur] = true
      return acc
    }, {})
  } else {
    Ignored_Exes = ignored_exes.reduce((acc, cur) => {
      acc[cur] = true
      return acc
    }, {})
  }

  const iniString = ini.stringify({DEFAULT, Ignored_Exes}).replaceAll('=true', '')

  fs.writeFile(Path.join(__dirname, '../../../config.ini'), iniString, (err) => {
    if (err) {
      next({status: 400, message: err})
    } else {
      res.status(200).json({message: 'INI successfully updated'})
    }
  })
})


module.exports = router
