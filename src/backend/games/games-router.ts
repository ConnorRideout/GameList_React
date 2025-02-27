/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/always-return */
import { Router } from 'express'
import sassVars from 'get-sass-vars'
import { promises as fs } from 'fs'

import * as Games from './games-model'

import { GameEntry, StringMap } from '../../types'


const router = Router()

function parseRawGameData(game: Games.RawGameEntry) {
  // format program_path
  game.program_path = JSON.parse(game.program_path);
  // format tags
  (game as any).tags = typeof game.tags === 'string' ? game.tags.split(',').sort() : []
  // format categories
  const { categories, protagonist } = game
  delete (game as any).protagonist
  const parsedCats: StringMap = { protagonist }
  categories.split(',').forEach(category => {
    const [cat, val] = category.split(':')
    parsedCats[cat] = val
  });
  (game as any).categories = parsedCats;
  // format status
  (game as any).status = game.status !== null ? game.status.split(',') : []
  // format timestamps
  const {created_at, updated_at, played_at} = game
  delete (game as any).created_at
  delete (game as any).updated_at
  delete (game as any).played_at;
  (game as any).timestamps = {created_at, updated_at, played_at};
  (game as any).timestamps_sec = {
    created_at: new Date(created_at.replace(' ', 'T')).getTime(),
    updated_at: updated_at ? new Date(updated_at.replace(' ', 'T')).getTime() : -Infinity,
    played_at: played_at ? new Date(played_at.replace(' ', 'T')).getTime() : -Infinity
  }
  Object.assign(game, game as unknown as GameEntry)
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

router.get('/games/:game_id', (req, res, next) => {
  Games.getById(req.params.game_id)
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

router.post('/games/new', (req, res, next) => {
  const game = req.body
  game.protagonist = game.categories.protagonist
  delete game.categories.protagonist
  game.program_path = JSON.stringify(game.program_path)
  Games.insertNewGame(game)
    .then(newGame => {
      if (newGame.error) {
        next(newGame)
      } else {
        parseRawGameData(newGame)
        res.status(201).json(newGame)
      }
    })
    .catch(next)
})

router.delete('/games/:game_id', (req, res, next) => {
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

router.put('/games/:game_id', async (req, res, next) => {
  const {game_id} = req.params
  // updatedGameData is a partial to complete GameEntry
  const updatedGameData = {...req.body, game_id}
  // get old game data
  const oldGameData = await Games.getById(parseInt(game_id))
  parseRawGameData(oldGameData)
  // overwrite oldGameData with updatedGameData
  const game = {...oldGameData, ...updatedGameData}
  // properly format the game data
  game.protagonist = game.categories.protagonist
  delete game.categories.protagonist
  game.program_path = JSON.stringify(game.program_path)
  // update it
  Games.updateGame(game)
    .then(updatedGame => {
      if (updatedGame.error) {
        next(updatedGame)
      } else {
        parseRawGameData(updatedGame)
        res.status(200).json(updatedGame)
      }
    })
    .catch(next)
})


module.exports = router
