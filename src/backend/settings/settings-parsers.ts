/* eslint-disable import/no-relative-packages */
import crypto from 'crypto'

import { RawSettings } from './settings-model'
import { StringMap, LoginType, SettingsType, UpdatedSettingsType, DefaultGamesFormType } from '../../types'
import { RawGameSettings } from '../games/games-model'


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

  decrypt(encryptedPassword: string) {
    const [encrypted, iv] = encryptedPassword.split('.')
    const decipher = crypto.createDecipheriv(this.algorithm, this.keyBuffer, Buffer.from(iv, 'hex'))
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
  }
}

let passwordEncryptor: PasswordEncryptor

function parseRawLogins(logins: RawSettings['logins']) {
  if (passwordEncryptor === undefined)
    passwordEncryptor = new PasswordEncryptor()
  const parsedLogins: (LoginType & {website_id: number})[] = []
  logins.forEach(login => {
    const {website_id, login_url, username, username_selector, password: encryptedPassword, password_selector, submit_selector} = login
    const password = (login_url && encryptedPassword) ? passwordEncryptor.decrypt(encryptedPassword) : null
    const parsedLogin = {website_id, login_url, username, username_selector, password, password_selector, submit_selector}
    parsedLogins.push(parsedLogin)
  })
  return parsedLogins
}

export function parseRawSettings(settings: RawSettings) {
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
  (settings as any).site_scraper_aliases = parsedScraperAliases;
  // parse categories
  settings.categories.forEach(cat => {
    cat.options = JSON.parse(cat.options)
  })
}

export function parseUpdatedSettingsToRaw(settings: UpdatedSettingsType, existingRawSettings: RawSettings): RawSettings & RawGameSettings {
  if (passwordEncryptor === undefined)
    passwordEncryptor = new PasswordEncryptor()
  const {
    categories: raw_categories, statuses, tags,
    games_folder, locale_emulator, file_types: raw_file_types, ignored_exes: raw_ignored_exes, site_scraper_aliases: raw_aliases, site_scrapers: raw_scrapers
  } = settings

  // TODO: reformat settings to correct raw state
  const defaults: RawSettings['defaults'] = [
    { name: 'games_folder', value: games_folder },
    { name: 'locale_emulator', value: locale_emulator }
  ]

  const file_types = Object.entries(raw_file_types).map((entry, idx) => {
    const [name, filetypes_arr] = entry
    const filetype_id = existingRawSettings.file_types.find(ft => ft.name === name)?.filetype_id || idx + 1
    const filetypes = filetypes_arr.join(', ')
    return {filetype_id, name, filetypes}
  })

  const ignored_exes: RawSettings['ignored_exes'] = raw_ignored_exes.map(exe => ({exe}))

  const site_scrapers: RawSettings['site_scrapers'] = []
  const logins: RawSettings['logins'] = []
  raw_scrapers.forEach(scraper => {
    const { website_id, base_url, selectors, login } = scraper

    selectors.forEach(selector => {
      site_scrapers.push({
        website_id,
        base_url,
        ...selector
      })
    })

    if (login) {
      const { password: rawPassword, ...loginRest } = login
      let password = null
      let password_iv = null

      if (rawPassword && loginRest.login_url) {
        const encrypted = passwordEncryptor.encrypt(rawPassword)
        password = `${encrypted.password}.${encrypted.password_iv}`
        password_iv = encrypted.password_iv
      }

      logins.push({
        website_id,
        base_url,
        password,
        password_iv,
        ...loginRest
      })
    }
  })

  const site_scraper_aliases: RawSettings['site_scraper_aliases'] = {
    tags: [], categories: [], statuses: []
  }

  const iters: [keyof RawSettings['site_scraper_aliases'], string][] = [
    ['tags', 'tag_name'],
    ['categories', 'category_option_name'],
    ['statuses', 'status_name']
  ]

  iters.forEach(([key, name]) => {
    Object.entries(raw_aliases[key]).forEach(([base_url, aliases]) => {
      const {website_id} = raw_scrapers.find(s => s.base_url === base_url)!
      aliases.forEach(([website_tag, alt_name]) => {
        site_scraper_aliases[key].push({
          website_id,
          base_url,
          website_tag,
          [name]: alt_name
        } as any)
      })
    })
  })

  // TODO: reformat gamesformtype

  const categories = raw_categories.reduce((acc: RawGameSettings['categories'], cat) => {
    const options = JSON.stringify(cat.options)
    acc.push({...cat, options})
    return acc
  }, [])

  return {
    tags,
    statuses,
    categories,
    defaults,
    file_types,
    ignored_exes,
    site_scrapers,
    logins,
    site_scraper_aliases
  }
}
