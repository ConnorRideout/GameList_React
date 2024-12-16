/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('games', (tbl) => {
      tbl.increments('game_id').primary()
      tbl.string('path', 2048).unique().notNullable()
      tbl.string('title').unique().notNullable()
      tbl.string('url').unique().notNullable()
      tbl.string('image').unique()
      tbl.string('version').unique().notNullable()
      tbl.string('description', 2048).unique().notNullable()
      tbl.string('program path').unique().notNullable()
    })
    .createTable('categories', (tbl) => {
      tbl.increments('category_id').primary()
      tbl.string('category_name').unique().notNullable()
    })
    .createTable('tags', (tbl) => {
      tbl.increments('tag_id').primary()
      tbl.string('tag_name').unique().notNullable()
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('tags')
    .dropTableIfExists('categories')
    .dropTableIfExists('games')
}
