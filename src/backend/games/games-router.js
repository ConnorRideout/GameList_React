/* eslint-disable promise/always-return */
const express = require('express')
const Games = require('./games-model')


const router = express.Router()

router.get('/', (req, res, next) => {
  Games.getAll()
    .then(games => {
      games.forEach(game => {
        // format tags
        game.tags = game.tags !== null ? game.tags.split(',') : []
        // format categories
        const {categories} = game
        delete game.categories
        categories.split(',').forEach(category => {
          const [cat, val] = category.split(':')
          game[cat] = val
        })
        // format status
        game.status = game.status !== null ? game.status.split(',') : []
      })
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
