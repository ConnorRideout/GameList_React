/* eslint-disable promise/always-return */
const express = require('express')
const Games = require('./games-model')


const router = express.Router()

router.get('/', (req, res, next) => {
  Games.getAll()
    .then(games => {
      res.status(200).json(games)
    })
    .catch(next)
})

router.get('/timestamps/:type', (req, res, next) => {
  Games.getTimestamps(req.params.type)
    .then(games => {
      res.status(200).json(games)
    })
    .catch(next)
})

router.get('/game/:id', (req, res, next) => {
  Games.getById(req.params.id)
    .then(game => {
      res.status(200).json(game)
    })
    .catch(next)
})

router.get('/tags', (req, res, next) => {
  Games.getTags()
    .then(tags => {
      res.status(200).json(tags)
    })
    .catch(next)
})

router.get('/status', (req, res, next) => {
  Games.getStatus()
    .then(cats => {
      res.status(200).json(cats)
    })
    .catch(next)
})

module.exports = router
