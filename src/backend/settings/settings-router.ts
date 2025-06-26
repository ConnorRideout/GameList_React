/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
import { Router } from 'express'

import * as Settings from './settings-model'
import { getCategoriesForSettings } from '../games/games-model'
import { parseRawSettings, parseUpdatedSettingsToRaw } from './settings-parsers'

import { UpdatedSettingsType } from '../../types'


const router = Router()



router.get('/', (req, res, next) => {
  Settings.getAll()
    .then(settings => {
      parseRawSettings(settings)
      res.status(200).json(settings)
    })
    .catch(next)
})

router.get('/login/:website_id', (req, res, next) => {
  const {website_id} = req.params
  Settings.getWebsiteLogin(parseInt(website_id))
    .then(login => {
      res.status(200).json(login)
    })
    .catch(next)
})

router.put('/', async (req, res, next) => {
  const updatedSettings: UpdatedSettingsType = req.body
  const existingRawSettings = await Settings.getAll()
  const rawUpdatedSettings = parseUpdatedSettingsToRaw(updatedSettings, existingRawSettings)
  Settings.updateSettings(rawUpdatedSettings)
    .then(newSettings => {
      parseRawSettings(newSettings)
      res.status(200).json(newSettings)
    })
    .catch(next)
})

router.put('/env', (req, res) => {
  const {key} = req.body
  process.env.SECRET_KEY = key
  res.json({message: 'Changed ENV variable'})
})


module.exports = router
