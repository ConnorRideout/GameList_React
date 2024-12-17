/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('games', (tbl) => {
      tbl.increments('game_id')
      tbl.string('path', 2048).unique().notNullable()
      tbl.string('title').unique().notNullable()
      tbl.string('url').unique().notNullable()
      tbl.string('image').unique()
      tbl.string('version').unique().notNullable()
      tbl.string('description', 2048).unique().notNullable()
      tbl.string('program path').unique().notNullable()
    })
    .createTable('categories', (tbl) => {
      tbl.increments('category_id')
      tbl.string('category_name').unique().notNullable()
    })
    .createTable('tags', (tbl) => {
      tbl.increments('tag_id')
      tbl.string('tag_name').unique().notNullable()
    })
    .createTable('games_categories', (tbl) => {
      tbl
        .integer('game_id')
        .unsigned()
        .notNullable()
        .references('game_id')
        .inTable('games')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl
        .integer('category_id')
        .unsigned()
        .notNullable()
        .references('category_id')
        .inTable('categories')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.primary(['game_id', 'category_id'])
    })
    .createTable('games_tags', (tbl) => {
      tbl
        .integer('game_id')
        .unsigned()
        .notNullable()
        .references('game_id')
        .inTable('games')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl
        .integer('tag_id')
        .unsigned()
        .notNullable()
        .references('tag_id')
        .inTable('tags')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.primary(['game_id', 'tag_id'])
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('games_tags')
    .dropTableIfExists('games_categories')
    .dropTableIfExists('tags')
    .dropTableIfExists('categories')
    .dropTableIfExists('games')
}
