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

async function getAll() {
  const defaults = await settingsdb('default').select('name', 'value')
  const file_types = await getFiletypes()
  const ignored_exes = await getIgnoredExes()
  const site_scrapers = await getWebsiteScrapers()
  return {defaults, file_types, ignored_exes, site_scrapers}
}


export {
  getIgnoredExes,
  getFiletypes,
  getWebsiteScrapers,
  getAll,
}
