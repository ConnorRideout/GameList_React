const router = require('express').Router()
const { exec } = require('child_process')
const { existsSync } = require('fs')


router.post('/play', (req, res) => {
  const {filepath} = req.body
  if (existsSync(filepath)) {
    exec(`start "" "${filepath}"`, (error) => {
      if (error) res.status(500).json({message: `failed to start ${filepath}`})
      else res.status(200).json({message: `started ${filepath}`})
    })
  } else {
    res.status(404).json({message: `file ${filepath} does not exist`})
  }
})


module.exports = router
