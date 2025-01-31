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
      tbl.string('program_path').unique().notNullable()
      tbl.string('protagonist').notNullable()
    })
    .createTable('status', (tbl) => {
      tbl.increments('status_id')
      tbl.string('status_name').unique().notNullable()
      tbl.integer('status_priority').unsigned().unique().notNullable()
      tbl.string('status_color').notNullable()
    })
    .createTable('tags', (tbl) => {
      tbl.increments('tag_id')
      tbl.string('tag_name').unique().notNullable()
    })
    .createTable('categories', (tbl) => {
      tbl.increments('category_id')
      tbl.string('category_name').unique().notNullable()
    })
    .createTable('category_options', tbl => {
      tbl.increments('option_id')
      tbl
        .integer('category_id')
        .unsigned()
        .notNullable()
        .references('category_id')
        .inTable('categories')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.string('option_name').notNullable()
    })
    .createTable('games_category_options', (tbl) => {
      tbl
        .integer('game_id')
        .unsigned()
        .notNullable()
        .references('game_id')
        .inTable('games')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl
        .integer('option_id')
        .unsigned()
        .notNullable()
        .references('option_id')
        .inTable('category_options')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.primary(['game_id', 'option_id'])
    })
    .createTable('games_status', (tbl) => {
      tbl
        .integer('game_id')
        .unsigned()
        .notNullable()
        .references('game_id')
        .inTable('games')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl
        .integer('status_id')
        .unsigned()
        .notNullable()
        .references('status_id')
        .inTable('status')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.primary(['game_id', 'status_id'])
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
    .createTable('timestamps', (tbl) => {
      tbl.integer('game_id').primary()
        .unsigned()
        .notNullable()
        .references('game_id')
        .inTable('games')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.timestamp('created_at').defaultTo(knex.fn.now())
      tbl.timestamp('updated_at').nullable()
      tbl.timestamp('played_at').nullable()
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('timestamps')
    .dropTableIfExists('games_tags')
    .dropTableIfExists('games_status')
    .dropTableIfExists('games_category_options')
    .dropTableIfExists('category_options')
    .dropTableIfExists('categories')
    .dropTableIfExists('tags')
    .dropTableIfExists('status')
    .dropTableIfExists('games')
}
