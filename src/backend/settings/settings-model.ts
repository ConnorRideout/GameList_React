/* eslint-disable import/no-relative-packages */
import { settingsdb, gamesdb } from "../data/db-config"

import { DefaultGamesFormType, StringMap } from "../../types"


type BaseScraperAlias = {
  website_id: number,
  base_url: string,
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
  }
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
     w.*,
     s.website_tag, s.tag_name
  FROM websites AS w
  LEFT JOIN
    scraper_tag_aliases AS s ON w.website_id = s.website_id
  */
  const tags = await settingsdb('websites AS w')
    .select('w.*', 's.website_tag', 's.tag_name')
    .leftJoin('scraper_tag_aliases AS s', 'w.website_id', 's.website_id')
  /*
  SELECT
     w.*,
     s.website_tag, s.category_option_name
  FROM websites AS w
  LEFT JOIN
    scraper_category_aliases AS s ON w.website_id = s.website_id
  */
  const categories = await settingsdb('websites AS w')
    .select('w.*', 's.website_tag', 's.category_option_name')
    .leftJoin('scraper_category_aliases AS s', 'w.website_id', 's.website_id')
  /*
  SELECT
     w.*,
     s.website_tag, s.status_name
  FROM websites AS w
  LEFT JOIN
    scraper_status_aliases AS s ON w.website_id = s.website_id
  */
  const statuses = await settingsdb('websites AS w')
    .select('w.*', 's.website_tag', 's.status_name')
    .leftJoin('scraper_status_aliases AS s', 'w.website_id', 's.website_id')
  return {tags, categories, statuses}
}

async function getAll() {
  const defaults = await settingsdb('default').select('name', 'value')
  const file_types = await getFiletypes()
  const ignored_exes = await getIgnoredExes()
  const site_scrapers = await getWebsiteScrapers()
  const logins = await getWebsiteLogins()
  const site_scraper_aliases = await getWebsiteScraperAliases()
  return {defaults, file_types, ignored_exes, site_scrapers, logins, site_scraper_aliases}
}

async function updateSettings(newSettings: RawSettings & DefaultGamesFormType) {
  // TODO: save settings
  console.log(newSettings)
  gamesdb()
  return newSettings
}


export {
  getIgnoredExes,
  getFiletypes,
  getWebsiteScrapers,
  getWebsiteLogin,
  getAll,
  updateSettings,
}
