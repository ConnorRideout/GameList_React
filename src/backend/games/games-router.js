/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/always-return */
const express = require('express')
const sassVars = require('get-sass-vars')
const { promises: fs} = require('fs')

const Games = require('./games-model')


const router = express.Router()

function parseRawGameData(game) {
  // format program_path
  game.program_path = JSON.parse(game.program_path)
  // format tags
  game.tags = typeof game.tags === 'string' ? game.tags.split(',').sort() : []
  // format categories
  const { categories, protagonist } = game
  delete game.protagonist
  const parsedCats = { protagonist }
  categories.split(',').forEach(category => {
    const [cat, val] = category.split(':')
    parsedCats[cat] = val
  })
  game.categories = parsedCats
  // format status
  game.status = game.status !== null ? game.status.split(',') : []
  // format timestamps
  const {created_at, updated_at, played_at} = game
  delete game.created_at
  delete game.updated_at
  delete game.played_at
  game.timestamps = {created_at, updated_at, played_at}
  game.timestamps_sec = {
    created_at: new Date(created_at.replace(' ', 'T')).getTime(),
    updated_at: updated_at ? new Date(updated_at.replace(' ', 'T')).getTime() : -Infinity,
    played_at: played_at ? new Date(played_at.replace(' ', 'T')).getTime() : -Infinity
  }
}

router.get('/games', (req, res, next) => {
  Games.getAll()
    .then(games => {
      games.forEach(game => {
        parseRawGameData(game)
      })
      res.status(200).json(games)
    })
    .catch(next)
})

router.get('/timestamps/:type', (req, res, next) => {
  let timeType = req.params.type
  if (!timeType.endsWith('_at')) timeType = `${timeType}_at`
  Games.getTimestamps(timeType)
    .then(games => {
      res.status(200).json(games)
    })
    .catch(next)
})

router.get('/games/:id', (req, res, next) => {
  Games.getById(req.params.id)
    .then(game => {
      parseRawGameData(game)
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

router.get('/statuses', (req, res, next) => {
  Games.getStatus()
    .then(status => {
      res.status(200).json(status)
    })
    .catch(next)
})

router.get('/categories', (req, res, next) => {
  Games.getCategories()
    .then(cats => {
      cats.forEach(cat => {
        cat.options = cat.options.split(',')
      })
      res.status(200).json(cats)
    })
    .catch(next)
})

router.get('/styles', (req, res, next) => {
  fs.readFile('../renderer/styles/variables.scss', 'utf-8')
    .then(css => {
      sassVars(css)
        .then(json => {
          res.status(200).json(json)
        })
        .catch(next)
    })
    .catch(next)
})

router.post('/new', (req, res, next) => {
  const game = req.body
  game.protagonist = game.categories.protagonist
  delete game.categories.protagonist
  game.program_path = JSON.stringify(game.program_path)
  Games.insertNewGame(game)
    .then(newGame => {
      if (newGame.error) {
        res.status(500).json(newGame)
      } else {
        parseRawGameData(newGame)
        res.status(201).json(newGame)
      }
    })
    .catch(next)
})

router.delete('/:game_id', (req, res, next) => {
  const {game_id} = req.params
  Games.deleteGame(game_id)
    .then(delGame => {
      parseRawGameData(delGame)
      res.status(200).json(delGame)
    })
    .catch(next)
})

router.put('/timestamps/:type/:game_id', (req, res, next) => {
  const {type, game_id} = req.params
  const timeType = type.endsWith('_at') ? type : `${type}_at`
  Games.updateTimestamp(game_id, timeType)
    .then(updatedGame => {
      parseRawGameData(updatedGame)
      res.status(200).json(updatedGame)
    })
    .catch(next)
})

module.exports = router
