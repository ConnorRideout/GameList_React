/* eslint-disable import/no-cycle */
/* eslint-disable import/no-relative-packages */
import { settingsdb } from "../data/db-config"

import { getCategoriesForSettings, updateGamesSettings, RawGameSettings } from '../games/games-model'

import { StringMap } from "../../types"


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
    password_iv: string | null,
    password_selector: string | null,
    submit_selector: string | null,
  }[],
  site_scraper_aliases: {
    tags: (BaseScraperAlias & {tag_name: string})[],
    categories: (BaseScraperAlias & {category_option_name: string})[],
    statuses: (BaseScraperAlias & {status_name: string})[]
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
  return settingsdb('ignored_exes')
}

function getFiletypes() {
  // SELECT * FROM filetypes
  return settingsdb('filetypes')
}

function getWebsiteScrapers() {
  /*
  SELECT
    w.*,
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
  return settingsdb('websites as w')
    .select(
      'w.*',
      's.type', 's.selector', 's.queryAll', 's.regex', 's.limit_text', 's.remove_regex'
    )
    .leftJoin('selectors AS s', 'w.website_id', 's.website_id')
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
  return settingsdb('websites')
}

function getWebsiteLogin(website_id: number) {
  return getWebsiteLogins()
    .where({website_id})
    .first()
}

async function getWebsiteScraperAliases() {
  /*
  SELECT
     website_id, website_tag, tag_name
  FROM scraper_tag_aliases
  */
  const tags = await settingsdb('scraper_tag_aliases')
    .select('website_id', 'website_tag', 'tag_name')
  /*
  SELECT
     website_id, website_tag, category_option_name
  FROM scraper_category_aliases
  */
  const categories = await settingsdb('scraper_category_aliases')
    .select('website_id', 'website_tag', 'category_option_name')
  /*
  SELECT
     website_id, website_tag, status_name
  FROM scraper_status_aliases
  */
  const statuses = await settingsdb('scraper_status_aliases')
    .select('website_id', 'website_tag', 'status_name')
  return {tags, categories, statuses}
}

async function getAll() {
  const defaults = await settingsdb('default').select('name', 'value')
  const file_types = await getFiletypes()
  const ignored_exes = await getIgnoredExes()
  const site_scrapers = await getWebsiteScrapers()
  const logins = await getWebsiteLogins()
  const site_scraper_aliases = await getWebsiteScraperAliases()
  const categories = await getCategoriesForSettings()
  return {defaults, file_types, ignored_exes, site_scrapers, logins, site_scraper_aliases, categories}
}

async function updateSettings(newSettings: RawSettings & RawGameSettings) {
  // TODO: save settings
  const {tags, categories, statuses, defaults, file_types, ignored_exes, logins, site_scrapers, site_scraper_aliases} = newSettings

  const trx = await settingsdb.transaction()

  try {
    // TODO: update defaults
    await trx('default').del()
    await trx('default').insert(defaults)

    // TODO: update file_types
    await trx('filetypes').del()
    await trx('filetypes').insert(file_types)

    // TODO: update ignored_exes
    await trx('ignored_exes').del()
    if (ignored_exes.length) {
      await trx('ignored_exes').insert(ignored_exes)
    }

    // TODO: update websites (from logins data)
    await trx('websites').del()
    if (logins.length) {
      await trx('websites').insert(logins)
    }

    // TODO: update selectors
    await trx('selectors').del()
    const selectorData = site_scrapers.map(scraper => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {base_url, ...rest} = scraper
      return rest
    })
    await trx('selectors').insert(selectorData)

    // TODO: update scraper_tag_aliases
    await trx('scraper_tag_aliases').del()
    if (site_scraper_aliases.tags.length) {
      await trx('scraper_tag_aliases').insert(site_scraper_aliases.tags)
    }

    // TODO: update scraper_category_aliases
    await trx('scraper_category_aliases').del()
    if (site_scraper_aliases.categories.length) {
      await trx('scraper_category_aliases').insert(site_scraper_aliases.categories)
    }

    // TODO: update scraper_status_aliases
    await trx('scraper_status_aliases').del()
    if (site_scraper_aliases.statuses.length) {
      await trx('scraper_status_aliases').insert(site_scraper_aliases.statuses)
    }

    // update game settings
    await updateGamesSettings({tags, categories, statuses})

    trx.commit()
    return getAll()
  } catch (error) {
    trx.rollback()
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
