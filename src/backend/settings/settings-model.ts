import { settingsdb } from "../data/db-config"


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
  */
  return settingsdb('websites as w')
    .select(
      'w.*',
      's.type', 's.selector', 's.queryAll', 's.regex', 's.limit_text', 's.remove_regex'
    )
    .leftJoin('selectors AS s', 'w.website_id', 's.website_id')
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
  const site_scraper_aliases = await getWebsiteScraperAliases()
  return {defaults, file_types, ignored_exes, site_scrapers, site_scraper_aliases}
}


export {
  getIgnoredExes,
  getFiletypes,
  getWebsiteScrapers,
  getAll,
}
