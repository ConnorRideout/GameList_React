/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
/* eslint-disable promise/always-return */
import { Router } from 'express'
import sassVars from 'get-sass-vars'
import { promises as fs } from 'fs'
import { spawnSync } from 'child_process'

import * as Games from './games-model'

import { CategoryEntry, GameEntry, StringMap } from '../../types'
import Path from '../../parsedPath'


const router = Router()

function parseRawGameData(game: Games.RawGameEntry, catOrder: CategoryEntry[]) {
  // format image
  game.image = JSON.parse(game.image)
  // format program_path
  game.program_path = JSON.parse(game.program_path);
  // format tags
  (game as any).tags = typeof game.tags === 'string' ? game.tags.split(',').sort() : []
  // format categories
  const { categories, protagonist } = game
  delete (game as any).protagonist
  const parsedCats: StringMap = {}
  categories.split(',').sort((a, b) => (
    catOrder.find(c => a.startsWith(c.category_name))!.category_id - catOrder.find(c => b.startsWith(c.category_name))!.category_id
  )).forEach(category => {
    const [cat, val] = category.split(':')
    parsedCats[cat] = val
  })
  parsedCats.protagonist = protagonist;
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


function handleImage(img: string): string {
  function imageMagick(path_in: string, pth_out: string) {
    const result = spawnSync('magick', ['convert', `${path_in}[0]`, '-resize', '1280x720>', pth_out])
    if (result.error) {
        throw new Error(`Execution error: ${result.error.message}`)
    }
    if (result.stderr.length > 0) {
        throw new Error(`Standard error: ${result.stderr.toString()}`)
    }
    return result.stdout.toString()
  }
  // convert image if necessary, handle gifs
  const img_dir = new Path(
    __dirname,
    '../data',
    process.env.SHOWCASING ? 'showcase/gameImages' : 'development/gameImages'
  )
  // create a Path of img, handling absolute vs relative img path
  const img_path = /^[A-Z]:/.test(img) ? new Path(img) : img_dir.join(img)
  if (!img_path.existsSync()) {
    throw new Error("Image does not exist")
  }
  // create a copy of img (if img is a gif, take the first frame) that is 720p in the image dir
  const new_image_path = img_dir.join(`${img_path.stem}.jpg`)
  imageMagick(img_path.path, new_image_path.path)
  // build the return array
  const res = [new_image_path.basename]
  if (img_path.ext.toLowerCase() === '.gif') {
    // handle gifs
    const gif_path = img_dir.join(img_path.basename)
    if (gif_path.path !== img_path.path)
      img_path.moveSync(gif_path)
    res.push(gif_path.basename)
  } else if (img_path.path !== new_image_path.path) {
    // if image was originally not in image dir, delete the original
    img_path.removeSync()
  }
  return JSON.stringify(res)
}

router.get('/games', (req, res, next) => {
  Games.getAll()
    .then(async games => {
      const category_order = await Games.getCategories()
      games.forEach(game => {
        parseRawGameData(game, category_order)
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
    .then(async game => {
      const category_order = await Games.getCategories()
      parseRawGameData(game, category_order)
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

router.post('/games/new', async (req, res, next) => {
  const game = req.body
  // properly format the game data
  game.image = await handleImage(game.image[0])
  game.protagonist = game.categories.protagonist
  delete game.categories.protagonist
  game.program_path = JSON.stringify(game.program_path)
  // insert it
  Games.insertNewGame(game)
    .then(async newGame => {
      if (newGame.error) {
        next(newGame)
      } else {
        const category_order = await Games.getCategories()
        parseRawGameData(newGame, category_order)
        res.status(201).json(newGame)
      }
    })
    .catch(next)
})

router.delete('/games/:game_id', (req, res, next) => {
  const {game_id} = req.params
  Games.deleteGame(game_id)
    .then(async delGame => {
      const category_order = await Games.getCategories()
      parseRawGameData(delGame, category_order)
      res.status(200).json(delGame)
    })
    .catch(next)
})

router.put('/timestamps/:type/:game_id', (req, res, next) => {
  const {type, game_id} = req.params
  const timeType = type.endsWith('_at') ? type : `${type}_at`
  Games.updateTimestamp(game_id, timeType)
    .then(async updatedGame => {
      const category_order = await Games.getCategories()
      parseRawGameData(updatedGame, category_order)
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
  const category_order = await Games.getCategories()
  parseRawGameData(oldGameData, category_order)
  // overwrite oldGameData with updatedGameData
  const game = {...oldGameData, ...updatedGameData}
  // properly format the game data
  game.image = await handleImage(game.image[0])
  game.protagonist = game.categories.protagonist
  delete game.categories.protagonist
  game.program_path = JSON.stringify(game.program_path)
  // update it
  Games.updateGame(game)
    .then(updatedGame => {
      if (updatedGame.error) {
        next(updatedGame)
      } else {
        parseRawGameData(updatedGame, category_order)
        res.status(200).json(updatedGame)
      }
    })
    .catch(next)
})

router.get('/dislikes', (req, res, next) => {
  Games.getDislikes()
    .then(dislikes => {
      res.status(200).json(dislikes)
    })
    .catch(next)
})

router.post('/dislikes', (req, res, next) => {
  const {game_title, dislike_reason} = req.body
  Games.insertNewDislike(game_title, dislike_reason)
    .then(new_dislike => {
      res.status(201).json(new_dislike)
    })
    .catch(next)
})

router.put('/dislikes/:dislike_id', (req, res, next) => {
  const { dislike_id } = req.params
  const {game_title, dislike_reason} = req.body
  Games.updateDislike(parseInt(dislike_id), game_title, dislike_reason)
    .then(updated_dislike => {
      res.status(200).json(updated_dislike)
    })
    .catch(next)
})

router.delete('/dislikes/:dislike_id', (req, res, next) => {
  const { dislike_id } = req.params
  Games.deleteDislike(parseInt(dislike_id))
    .then(deleted_dislike => {
      res.status(200).json(deleted_dislike)
    })
    .catch(next)
})


module.exports = router
