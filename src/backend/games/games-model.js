const knex = require('knex')

const db = require('../../data/db-config')


function findAll() {
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
    .select('g.*')
    .leftJoin('games_tags as gt', 'g.game_id', 'gt.game_id')
    .leftJoin('tags as t', 'gt.tag_id', 't.tag_id')
    .leftJoin('games_categories as gc', 'g.game_id', 'gc.game_id')
    .leftJoin('categories as c', 'gc.category_id', 'c.category_id')
    .groupBy('g.game_id')
    .select(db.raw('GROUP_CONCAT(DISTINCT t.tag_name) AS tags'))
    .select(db.raw('GROUP_CONCAT(DISTINCT c.category_name) AS categories'))
}



module.exports = {
  findAll
}
