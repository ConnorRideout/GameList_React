/* eslint-disable import/no-cycle */
/* eslint-disable import/no-relative-packages */
import { settingsdb } from "../data/db-config"

import { getCategoriesForSettings, updateGamesSettings, RawGameSettings } from '../games/games-model'

import { StringMap } from "../../types"
import { ParsedRawSettingsType } from "./settings-parsers"


type BaseScraperAlias = {
  website_id: number,
  website_tag: string,
  [key: string]: number | string
}
export interface RawSettings {
  defaults: {name: string, value: string}[],
  file_types: {filetype_id: number, name: string, filetypes: string}[],
  ignored_exes: StringMap[],
  site_scrapers: {
    website_id: number,
    base_url: string,
    type: string,
    selector: string,
    queryAll: boolean,
    regex: string | null,
    limit_text: boolean,
    remove_regex: string | null,
  }[],
  logins: {
    website_id: number,
    base_url: string,
    login_url: string | null,
    username: string | null,
    username_selector: string | null,
    password: string | null,
    password_selector: string | null,
    submit_selector: string | null,
  }[],
  site_scraper_aliases: {
    tags: (BaseScraperAlias & {tag_id: number, tag_name?: string})[],
    categories: (BaseScraperAlias & {category_option_id: number, category_option_name?: string})[],
    statuses: (BaseScraperAlias & {status_id: number, status_name?: string})[]
  },
  categories: {
    category_id: number,
    category_name: string,
    options: string,
    default_option: string | null
  }[]
}
function getIgnoredExes() {
  // SELECT * FROM ignored_exes
  return settingsdb('settings_ignored_exes')
}

function getFiletypes() {
  // SELECT * FROM filetypes
  return settingsdb('settings_filetypes')
}

function getWebsiteScrapers() {
  /*
  SELECT
    w.website_id, w.base_url,
    s.type, s.selector, s.queryAll, s.regex, s.limit_text, s.remove_regex
  FROM websites AS w
  LEFT JOIN
    selectors AS s ON w.website_id = s.website_id
  ORDER BY
    CASE s.type
      WHEN 'title' THEN 1
      WHEN 'version' THEN 2
      WHEN 'description' THEN 3
      ELSE 4
    END, s.type
  */
  return settingsdb('settings_websites as w')
    .select(
      'w.website_id', 'w.base_url',
      's.type', 's.selector', 's.queryAll', 's.regex', 's.limit_text', 's.remove_regex'
    )
    .leftJoin('settings_selectors AS s', 'w.website_id', 's.website_id')
    .orderByRaw(`
        CASE s.type
          WHEN 'title' THEN 1
          WHEN 'version' THEN 2
          WHEN 'description' THEN 3
          ELSE 4
        END, s.type
      `)
}

function getWebsiteLogins() {
  /*
  SELECT * FROM websites
  */
  return settingsdb('settings_websites')
}

function getWebsiteLogin(website_id: number) {
  return getWebsiteLogins()
    .where({website_id})
    .first()
}

async function getWebsiteScraperAliases() {
  /*
  SELECT
    a.website_id, a.website_tag, a.tag_id, t.tag_name
  FROM settings_scraper_tag_aliases AS a
  LEFT JOIN tags AS t ON a.tag_id = t.tag_id
  */
  const tags = await settingsdb('settings_scraper_tag_aliases AS a')
    .select('a.website_id', 'a.website_tag', 'a.tag_id', 't.tag_name')
    .leftJoin('tags as t', 'a.tag_id', 't.tag_id')
  /*
  SELECT
    a.website_id, a.website_tag, a.category_option_id, co.option_name AS category_option_name
  FROM settings_scraper_category_aliases AS a
  LEFT JOIN category_options AS co ON a.category_option_id = co.option_id
  */
  const categories = await settingsdb('settings_scraper_category_aliases AS a')
    .select('a.website_id', 'a.website_tag', 'a.category_option_id', 'co.option_name AS category_option_name')
    .leftJoin('category_options AS co', 'a.category_option_id', 'co.option_id')
  /*
  SELECT
    a.website_id, a.website_tag, a.status_id, s.status_name
  FROM settings_scraper_status_aliases AS a
  LEFT JOIN status AS s ON a.status_id = s.status_id
  */
  const statuses = await settingsdb('settings_scraper_status_aliases AS a')
    .select('a.website_id', 'a.website_tag', 'a.status_id', 's.status_name')
    .leftJoin('status AS s', 'a.status_id', 's.status_id')
  return {tags, categories, statuses}
}

async function getAll() {
  const defaults = await settingsdb('settings_default').select('name', 'value')
  const file_types = await getFiletypes()
  const ignored_exes = await getIgnoredExes()
  const site_scrapers = await getWebsiteScrapers()
  const logins = await getWebsiteLogins()
  const site_scraper_aliases = await getWebsiteScraperAliases()
  const categories = await getCategoriesForSettings()
  return {defaults, file_types, ignored_exes, site_scrapers, logins, site_scraper_aliases, categories}
}

async function updateSettings(newSettings: ParsedRawSettingsType) {
  // save settings
  const {tags, categories, statuses, defaults, file_types, ignored_exes, logins, site_scrapers, site_scraper_aliases} = newSettings

  const trx = await settingsdb.transaction()

  try {
    // update defaults
    await trx('settings_default').del()
    await trx('settings_default').insert(defaults)

    // update file_types
    await trx('settings_filetypes').del()
    await trx('settings_filetypes').insert(file_types)

    // update ignored_exes
    await trx('settings_ignored_exes').del()
    if (ignored_exes.length) {
      await trx('settings_ignored_exes').insert(ignored_exes)
    }

    // update websites (from logins data)
    await trx('settings_websites').del()
    if (logins.length) {
      await trx('settings_websites').insert(logins)
    }

    // update selectors
    await trx('settings_selectors').del()
    const selectorData = site_scrapers.map(scraper => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {base_url, ...rest} = scraper
      return rest
    })
    await trx('settings_selectors').insert(selectorData)

    // update scraper_tag_aliases
    await trx('settings_scraper_tag_aliases').del()
    if (site_scraper_aliases.tags.length) {
      await trx('settings_scraper_tag_aliases').insert(site_scraper_aliases.tags)
    }

    // update scraper_category_aliases
    await trx('settings_scraper_category_aliases').del()
    if (site_scraper_aliases.categories.length) {
      await trx('settings_scraper_category_aliases').insert(site_scraper_aliases.categories)
    }

    // update scraper_status_aliases
    await trx('settings_scraper_status_aliases').del()
    if (site_scraper_aliases.statuses.length) {
      await trx('settings_scraper_status_aliases').insert(site_scraper_aliases.statuses)
    }

    // update game settings
    await updateGamesSettings({tags, categories, statuses}, trx)

    await trx.commit()
    return await getAll()
  } catch (error) {
    await trx.rollback()
    throw error
  }
}


export {
  getIgnoredExes,
  getFiletypes,
  getWebsiteScrapers,
  getWebsiteLogin,
  getAll,
  updateSettings,
}
