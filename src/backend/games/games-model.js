const db = require('../../data/db-config')


function getAll() {
  /*
  SELECT
      g.*,
      GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
      GROUP_CONCAT(DISTINCT c.status_name) AS status
  FROM
      games AS g
  LEFT JOIN
      games_tags AS gt ON g.game_id = gt.game_id
  LEFT JOIN
      tags AS t ON gt.tag_id = t.tag_id
  LEFT JOIN
      games_status AS gc ON g.game_id = gc.game_id
  LEFT JOIN
      status AS c ON gc.status_id = c.status_id
  GROUP BY
      g.game_id;
  */
  return db('games as g')
    .select(
      'g.*',
      db.raw('GROUP_CONCAT(DISTINCT t.tag_name) AS tags'),
      db.raw('GROUP_CONCAT(DISTINCT c.status_name) AS status'),
      'time.created_at', 'time.played_at', 'time.updated_at'
    )
    .leftJoin('games_tags as gt', 'g.game_id', 'gt.game_id')
    .leftJoin('tags as t', 'gt.tag_id', 't.tag_id')
    .leftJoin('games_status as gc', 'g.game_id', 'gc.game_id')
    .leftJoin('status as c', 'gc.status_id', 'c.status_id')
    .leftJoin('timestamps as time', 'g.game_id', 'time.game_id')
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
