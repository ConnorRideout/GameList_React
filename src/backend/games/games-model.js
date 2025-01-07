const knex = require('knex')

const db = require('../../data/db-config')


function getAll() {
  /*
  SELECT
      g.*,
      GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
      GROUP_CONCAT(DISTINCT c.category_name) AS categories
  FROM
      games AS g
  LEFT JOIN
      games_tags AS gt ON g.game_id = gt.game_id
  LEFT JOIN
      tags AS t ON gt.tag_id = t.tag_id
  LEFT JOIN
      games_categories AS gc ON g.game_id = gc.game_id
  LEFT JOIN
      categories AS c ON gc.category_id = c.category_id
  GROUP BY
      g.game_id;
  */
  return db('games as g')
    .select(
      'g.*',
      db.raw('GROUP_CONCAT(DISTINCT t.tag_name) AS tags'),
      db.raw('GROUP_CONCAT(DISTINCT c.category_name) AS categories'),
      'time.created_at', 'time.played_at', 'time.updated_at'
    )
    .leftJoin('games_tags as gt', 'g.game_id', 'gt.game_id')
    .leftJoin('tags as t', 'gt.tag_id', 't.tag_id')
    .leftJoin('games_categories as gc', 'g.game_id', 'gc.game_id')
    .leftJoin('categories as c', 'gc.category_id', 'c.category_id')
    .leftJoin('timestamps as time', 'g.game_id', 'time.game_id')
    .groupBy('g.game_id')
    .orderBy('g.title')
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



module.exports = {
  getAll,
  getTimestamps,
  getById
}
