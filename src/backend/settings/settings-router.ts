/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
import { Router } from 'express'
import * as Settings from './settings-model'

import { StringMap, SettingsType } from '../../types'


const router = Router()

function parseRawSettings(settings: Settings.RawSettings) {
  // parse defaults
  const { games_folder, locale_emulator } = settings.defaults.reduce((acc: StringMap, { name, value }) => {
    acc[name] = value
    return acc
  }, {})
  delete (settings as any).defaults;
  (settings as any).games_folder= games_folder;
  (settings as any).locale_emulator = locale_emulator
  // parse file types
  const parsedFileTypes = settings.file_types.reduce((acc: {[key: string]: string[]}, { name, filetypes }) => {
    acc[name] = filetypes.split(',').map(ftype => ftype.trim().toLowerCase())
    return acc
  }, {});
  (settings as any).file_types = parsedFileTypes;
  // parse ignored_exes
  (settings as any).ignored_exes = settings.ignored_exes.map(ignore => ignore.exe)
  // parse site scrapers
  const parsedSiteScrapers = settings.site_scrapers.reduce((acc: SettingsType['site_scrapers'], cur) => {
    const {website_id, base_url, ...rest} = cur
    const oldAcc = acc[website_id - 1]
    rest.queryAll = Boolean(rest.queryAll)
    rest.limit_text = Boolean(rest.limit_text)
    if (oldAcc === undefined) {
      acc[website_id - 1] = {base_url, selectors: [rest]}
    } else {
      acc[website_id - 1].selectors.push(rest)
    }
    return acc
  }, []);
  (settings as any).site_scrapers = parsedSiteScrapers
  // parse site scraper aliases
  const parsedScraperAliases = Object.entries(settings.site_scraper_aliases).reduce((acc: {[key: string]: {[url: string]: [string, string][]}}, [type, aliasArr]) => {
    const parsedAliases = aliasArr.reduce((acc1: {[url: string]: [string, string][]}, row) => {
      const {base_url, website_tag} = row
      const native_name = Object.keys(row).at(-1)!
      const native_value = (row[native_name] as string)
      const curVal = acc1[base_url] || []
      if (website_tag && native_value)
        curVal.push([website_tag, native_value])
      acc1[base_url] = curVal
      return acc1
    }, {})
    acc[type] = parsedAliases
    return acc
  }, {});
  (settings as any).site_scraper_aliases = parsedScraperAliases
}

router.get('/', (req, res, next) => {
  Settings.getAll()
    .then(settings => {
      parseRawSettings(settings)
      res.status(200).json(settings)
    })
    .catch(next)
})

router.put('/', (req, res, next) => {
  const newSettings = req.body
  Settings.updateSettings(newSettings)
    .then(updatedSettings => {
      parseRawSettings(updatedSettings)
      res.status(200).json(updatedSettings)
    })
    .catch(next)
})


module.exports = router
