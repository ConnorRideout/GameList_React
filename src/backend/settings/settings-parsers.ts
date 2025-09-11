/* eslint-disable import/no-relative-packages */
import crypto from 'crypto'

import { RawSettings } from './settings-model'
import { StringMap, LoginType, SettingsType, UpdatedSettingsType, ScraperAliasesType, CategorySettingsEntry } from '../../types'
import { RawGameSettings } from '../games/games-model'



function secretCheck() {
  const keyparts = process.env.SECRET_KEY?.split('.')
  if (!keyparts || (keyparts.length === 2 && keyparts[0].length === 32 && keyparts[1].length === 32)) {
    console.error("Secret Key has not been properly set!")
    console.error("Secret Key has not been properly set!")
    console.error("Secret Key has not been properly set!")
  }
}

class PasswordEncryptor {
  algorithm: crypto.CipherCCMTypes

  keyBuffer: crypto.CipherKey

  constructor() {
    this.algorithm = 'aes-256-cbc' as crypto.CipherCCMTypes
    secretCheck()
    const secretKey = process.env.SECRET_KEY!
    // console.log(`encryptor secret key = ${secretKey}`)
    this.keyBuffer = crypto.createHash('sha256').update(secretKey).digest() as crypto.CipherKey
  }


  encrypt(text: string) {
    secretCheck()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.keyBuffer, iv as crypto.BinaryLike);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return { password_iv: iv.toString('hex'), password: encrypted };
  }

  decrypt(encryptedPassword: string) {
    secretCheck()
    const [encrypted, ivHex] = encryptedPassword.split('.')
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(this.algorithm, this.keyBuffer, iv as crypto.BinaryLike)
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8')
    decrypted += decipher.final('utf-8')
    return decrypted
  }
}

let passwordEncryptor: PasswordEncryptor

export function parseRawLogin(login: RawSettings['logins'][0]) {
  if (passwordEncryptor === undefined)
    passwordEncryptor = new PasswordEncryptor()
  const {website_id, login_url, username, username_selector, password: encryptedPassword, password_selector, submit_selector} = login
  const password = (login_url && encryptedPassword) ? passwordEncryptor.decrypt(encryptedPassword) : null
  const parsedLogin = {website_id, login_url, username, username_selector, password, password_selector, submit_selector}
  return parsedLogin
}

function parseAliases(scraper_aliases: RawSettings['site_scraper_aliases']) {
  const parsedScraperAliases = Object.entries(scraper_aliases).reduce((acc: {[website_id: number]: ScraperAliasesType}, cur) => {
    const [type, aliases] = cur
    aliases.forEach(row => {
      const {website_id, website_tag} = row
      // find the native name, i.e. tag_name, category_name, or status_name
      const native_name = Object.keys(row).find(k => k.endsWith('_name'))!
      const native_value = row[native_name] as string
      const native_id = Object.entries(row).find(([key]) => (
        /^(tag|status|category_option)_id/.test(key)
      ))![1] as number
      // check if the website_id already is in the accumulator
      if (!acc[website_id]) {
        acc[website_id] = {
          tags: [],
          categories: [],
          statuses: []
        }
      }
      const cur_site = acc[website_id]
      // add the aliases
      const cur_type = cur_site[type]
      cur_type.push([website_tag, native_value, native_id])
    })
    return acc
  }, {})
  return parsedScraperAliases
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
  const parsedLogins: (LoginType & {website_id: number})[] = []
  settings.logins.forEach(login => { parsedLogins.push(parseRawLogin(login)) } )
  // parse site scraper aliases
  const parsedScraperAliases = parseAliases(settings.site_scraper_aliases)
  // parse site scrapers
  const parsedSiteScrapers = settings.site_scrapers.reduce((acc: SettingsType['site_scrapers'], cur) => {
    const {website_id, base_url, ...rest} = cur
    const oldAcc = acc[website_id]
    rest.queryAll = Boolean(rest.queryAll)
    rest.limit_text = Boolean(rest.limit_text)
    if (oldAcc === undefined) {
      const login: LoginType = parsedLogins.find(l => l.website_id === website_id)!
      delete (login as any).website_id
      const aliases = parsedScraperAliases[website_id]
      acc[website_id] = {website_id, base_url, login, aliases, selectors: [rest]}
    } else {
      acc[website_id].selectors.push(rest)
    }
    return acc
  }, []);
  (settings as any).site_scrapers = parsedSiteScrapers.filter(s => s)

  // parse categories
  settings.categories.forEach(cat => {
    cat.options = JSON.parse(cat.options)
  })
}

export type ParsedRawSettingsType = Omit<RawSettings, 'categories'> & Omit<RawGameSettings, 'categories'> & {categories: CategorySettingsEntry[]}

export function parseUpdatedSettingsToRaw(settings: UpdatedSettingsType, existingRawSettings: RawSettings): ParsedRawSettingsType {
  if (passwordEncryptor === undefined)
    passwordEncryptor = new PasswordEncryptor()
  const {
    categories, statuses, tags,
    games_folder, locale_emulator, file_types: raw_file_types, ignored_exes: raw_ignored_exes, site_scrapers: raw_scrapers
  } = settings

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

  // handle the separation of site_scrapers into its constituants
  const site_scrapers: RawSettings['site_scrapers'] = []
  const logins: RawSettings['logins'] = []
  const site_scraper_aliases: RawSettings['site_scraper_aliases'] = {
    tags: [], categories: [], statuses: []
  }
  raw_scrapers.forEach(scraper => {
    const { website_id, base_url, selectors, login, aliases } = scraper

    selectors.forEach(selector => {
      site_scrapers.push({
        website_id,
        base_url,
        ...selector
      })
    })
    // logins
    if (login) {
      const { password: rawPassword, ...loginRest } = login
      let password = null

      if (rawPassword && loginRest.login_url) {
        const encrypted = passwordEncryptor.encrypt(rawPassword)
        password = `${encrypted.password}.${encrypted.password_iv}`
      }

      logins.push({
        website_id,
        base_url,
        password,
        ...loginRest
      })
    }
    // aliases
    aliases.tags.forEach(([website_tag, tag_name, tag_id]) => {
      site_scraper_aliases.tags.push({website_id, website_tag,  tag_id})
    })

    aliases.categories.forEach(([website_tag, category_option_name, category_option_id]) => {
      site_scraper_aliases.categories.push({website_id, website_tag, category_option_id})
    })

    aliases.statuses.forEach(([website_tag, status_name, status_id]) => {
      site_scraper_aliases.statuses.push({website_id, website_tag, status_id})
    })

  })

  // reformat gamesformtype (only categories is different)
  // const categories = raw_categories.reduce((acc: RawGameSettings['categories'], cat) => {
  //   const options = JSON.stringify(cat.options)
  //   acc.push({...cat, options})
  //   return acc
  // }, [])

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
