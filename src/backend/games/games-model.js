const db = require('../../data/db-config')


function getAll() {
  /*
  SELECT
      g.*,
      GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
      GROUP_CONCAT(DISTINCT s.status_name) AS status,
      GROUP_CONCAT(DISTINCT c.category_name || ': ' || co.option_name) AS categories,
      time.created_at, time.played_at, time.updated_at
  FROM
      games AS g
  LEFT JOIN
      games_tags AS gt ON g.game_id = gt.game_id
  LEFT JOIN
      tags AS t ON gt.tag_id = t.tag_id
  LEFT JOIN
      games_status AS gs ON g.game_id = gs.game_id
  LEFT JOIN
      status AS s ON gs.status_id = s.status_id
  LEFT JOIN
      games_category_options AS gco ON g.game_id = gco.game_id
  LEFT JOIN
      category_options AS co ON gco.option_id = co.option_id
  LEFT JOIN
      categories AS c ON co.category_id = c.category_id
  LEFT JOIN
      timestamps AS time ON g.game_id = time.game_id
  GROUP BY
      g.game_id
  ORDER BY
      CASE
          WHEN g.title GLOB '[^a-zA-Z0-9]*' THEN 0
          ELSE 1
      END, g.title ASC
  */
  return db('games as g')
    .select(
      'g.*',
      db.raw('GROUP_CONCAT(DISTINCT t.tag_name) AS tags'),
      db.raw('GROUP_CONCAT(DISTINCT s.status_name) AS status'),
      db.raw('GROUP_CONCAT(DISTINCT c.category_name || ": " || co.option_name) AS categories'),
      'time.created_at', 'time.played_at', 'time.updated_at'
    )
    .leftJoin('games_tags AS gt', 'g.game_id', 'gt.game_id')
    .leftJoin('tags AS t', 'gt.tag_id', 't.tag_id')
    .leftJoin('games_status AS gs', 'g.game_id', 'gs.game_id')
    .leftJoin('status AS s', 'gs.status_id', 's.status_id')
    .leftJoin('games_category_options AS gco', 'g.game_id', 'gco.game_id')
    .leftJoin('category_options AS co', 'gco.option_id', 'co.option_id')
    .leftJoin('categories AS c', 'co.category_id', 'c.category_id')
    .leftJoin('timestamps AS time', 'g.game_id', 'time.game_id')
    .groupBy('g.game_id')
    // .orderBy('g.title')
    .orderByRaw(`
        CASE
          WHEN g.title GLOB '[^a-zA-Z0-9]*' THEN 0
          ELSE 1
        END, g.title ASC
      `)
}

function getTimestamps(type) {
  return db('games as g')
    .select('g.game_id', `t.${type}_at`)
    .leftJoin('timestamps as t', 'g.game_id', 't.game_id')
    .orderBy(`t.${type}_at`, 'desc')
}

function getById(gameId) {
  return getAll()
    .where({'g.game_id': gameId})
    .first()
}

function getTags() {
  return db('tags')
    .orderByRaw(`
        CASE
          WHEN tag_name GLOB '[^a-zA-Z0-9]*' THEN 0
          ELSE 1
        END, tag_name ASC
      `)
}

function getStatus() {
  return db('status')
    .orderByRaw(`
        CASE
          WHEN status_name GLOB '[^a-zA-Z0-9]*' THEN 0
          ELSE 1
        END, status_name ASC
      `)
}



module.exports = {
  getAll,
  getTimestamps,
  getById,
  getTags,
  getStatus
}
