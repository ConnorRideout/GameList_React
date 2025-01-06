const express = require('express')
const Games = require('./games-model')


const router = express.Router()

router.get('/', (req, res, next) => {
  Games.findAll()
    .then(games => {
      res.status(200).json(games)
    })
    .catch(next)
})

module.exports = router
