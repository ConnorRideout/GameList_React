/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable promise/always-return */
const db = require('../data/db-config')


function getAll() {
  /*
  SELECT
      g.*,
      GROUP_CONCAT(DISTINCT t.tag_name) AS tags,
      GROUP_CONCAT(DISTINCT s.status_name) AS status,
      GROUP_CONCAT(DISTINCT c.category_name || ':' || co.option_name) AS categories,
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
      db.raw('GROUP_CONCAT(DISTINCT c.category_name || ":" || co.option_name) AS categories'),
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
    .where({ 'g.game_id': gameId })
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
    .orderBy('status_priority')
}

function getCategories() {
  /*
  SELECT
    c.*,
    GROUP_CONCAT(o.option_name) AS options
  FROM
    categories AS c
  JOIN
    category_options AS o ON c.category_id = o.category_id
  GROUP BY
    c.category_id
  */
  return db('categories as c')
    .select(
      'c.*',
      db.raw('GROUP_CONCAT(o.option_name) AS options')
    )
    .join('category_options AS o', 'c.category_id', 'o.category_id')
    .groupBy('c.category_id')
    .orderBy('c.category_name', 'desc')
}

function getTagByName(tag_name) {
  /*
  SELECT *
  FROM tags
  WHERE tag_name="Gay"
  */
  return db('tags')
    .where({ tag_name })
    .first()
}

function getStatusByName(status_name) {
  /*
  SELECT *
  FROM status
  WHERE status_name="Favorite"
  */
  return db('status')
    .where({ status_name })
    .first()
}

function getCategoryByName(category_name) {
  /*
  SELECT *
  FROM categories
  WHERE category_name="art"
  */
  return db('categories')
    .where({ category_name })
    .first()
}

function getCategoryOptionsByCategoryId(category_id) {
  /*
  SELECT option_id, option_name
  FROM category_options
  WHERE category_id=2
  */
  return db('category_options')
    .select('option_id', 'option_name')
    .where({ category_id })
}

async function insertNewGame(game) {
  const { path, title, url, image, version, description, program_path, protagonist, tags, status, categories } = game
  const timestamps = game.timestamps || {}

  // Fetch all necessary IDs before starting the transaction
  const tagIds = await Promise.all(tags.map(tag => getTagByName(tag)))
  const statusIds = await Promise.all(status.map(stat => getStatusByName(stat)))
  const categoryIds = await Promise.all(Object.entries(categories).map(async ([cat, val]) => {
    const { category_id } = await getCategoryByName(cat)
    const catOpts = await getCategoryOptionsByCategoryId(category_id)
    const {option_id} = catOpts.find(({ option_name }) => option_name === val)
    return { category_id, option_id }
  }))

  const trx = await db.transaction()

  try {
    // Insert into games
    const [game_id] = await trx('games')
      .insert({ path, title, url, image, version, description, program_path, protagonist })

    // Insert tags
    for (const { tag_id } of tagIds) {
      await trx('games_tags').insert({ game_id, tag_id })
    }

    // Insert status
    for (const { status_id } of statusIds) {
      await trx('games_status').insert({ game_id, status_id })
    }

    // Insert categories
    for (const { option_id } of categoryIds) {
      await trx('games_category_options').insert({ game_id, option_id })
    }

    // Insert into timestamps
    await trx('timestamps').insert({ game_id, ...timestamps })

    // Commit and return the new game
    await trx.commit()
    const newGame = await getById(game_id)
    return newGame
  } catch (error) {
    await trx.rollback()
    console.error('Transaction failed:', error)
    return { title, error }
  }
}

async function deleteGame(game_id) {
  const delGame = await getById(game_id)
  await db('games').where({ game_id }).del()
  return delGame
}



module.exports = {
  getAll,
  getTimestamps,
  getById,
  getTags,
  getStatus,
  getCategories,
  insertNewGame,
  deleteGame,
}
