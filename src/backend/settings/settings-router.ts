/* eslint-disable import/no-relative-packages */
/* eslint-disable promise/no-callback-in-promise */
import { Router } from 'express'
import crypto from 'crypto'

import * as Settings from './settings-model'

import { StringMap, LoginType, SettingsType, UpdatedSettingsType, DefaultGamesFormType } from '../../types'


const router = Router()

class PasswordEncryptor {
  algorithm: string

  keyBuffer: Buffer

  constructor() {
    this.algorithm = 'aes-256-cbc'
    this.keyBuffer = crypto.createHash('sha256').update(process.env.SECRET_KEY!).digest()
  }

  encrypt(text: string) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.keyBuffer, iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return { password_iv: iv.toString('hex'), password: encrypted };
  }

  decrypt(encryptedPassword: string, iv: string) {
    const decipher = crypto.createDecipheriv(this.algorithm, this.keyBuffer, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
  }
}

let passwordEncryptor: PasswordEncryptor

function parseRawLogins(logins: Settings.RawSettings['logins']) {
  if (passwordEncryptor === undefined)
    passwordEncryptor = new PasswordEncryptor()
  const parsedLogins: (LoginType & {website_id: number})[] = []
  logins.forEach(login => {
    const {website_id, login_url, username, username_selector, password: encryptedPassword, password_iv, password_selector, submit_selector} = login
    const password = (login_url && encryptedPassword && password_iv) ? passwordEncryptor.decrypt(encryptedPassword, password_iv) : null
    const parsedLogin = {website_id, login_url, username, username_selector, password, password_selector, submit_selector}
    parsedLogins.push(parsedLogin)
  })
  return parsedLogins
}

function parseRawSettings(settings: Settings.RawSettings) {
  if (passwordEncryptor === undefined)
    passwordEncryptor = new PasswordEncryptor()
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
  // parse ignored exes
  (settings as any).ignored_exes = settings.ignored_exes.map(ignore => ignore.exe)
  // parse site logins
  const parsedLogins = parseRawLogins(settings.logins)
  // parse site scrapers
  const parsedSiteScrapers = settings.site_scrapers.reduce((acc: SettingsType['site_scrapers'], cur) => {
    const {website_id, base_url, ...rest} = cur
    const oldAcc = acc[website_id]
    rest.queryAll = Boolean(rest.queryAll)
    rest.limit_text = Boolean(rest.limit_text)
    if (oldAcc === undefined) {
      // const {login_url, username, username_selector, password: encryptedPassword, password_iv, password_selector, submit_selector} = settings.logins.find(l => l.website_id === website_id)!
      // const password = (encryptedPassword && password_iv) ? passwordEncryptor.decrypt(encryptedPassword, password_iv) : null
      // const login = {login_url, username, username_selector, password, password_selector, submit_selector}
      const login: LoginType = parsedLogins.find(l => l.website_id === website_id)!
      delete (login as any).website_id
      acc[website_id] = {website_id, base_url, login, selectors: [rest]}
    } else {
      acc[website_id].selectors.push(rest)
    }
    return acc
  }, []);
  (settings as any).site_scrapers = parsedSiteScrapers.filter(s => s)
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

router.get('/login/:website_id', (req, res, next) => {
  const {website_id} = req.params
  Settings.getWebsiteLogin(parseInt(website_id))
    .then(login => {
      res.status(200).json(login)
    })
    .catch(next)
})

function parseUpdatedSettings(settings: UpdatedSettingsType): Settings.RawSettings & DefaultGamesFormType {
  if (passwordEncryptor === undefined)
    passwordEncryptor = new PasswordEncryptor()
  // TODO: reformat settings to correct raw state

  return settings as unknown as Settings.RawSettings & DefaultGamesFormType
}

router.put('/', (req, res, next) => {
  const updatedSettings: UpdatedSettingsType = req.body
  const rawUpdatedSettings = parseUpdatedSettings(updatedSettings)
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
