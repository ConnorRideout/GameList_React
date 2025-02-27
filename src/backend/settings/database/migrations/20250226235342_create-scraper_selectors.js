/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('websites', tbl => {
      tbl.increments('website_id')
      tbl.string('base_url').unique().notNullable()
    })
    .createTable('selectors', tbl => {
      tbl.increments('selector_id')
      tbl
        .integer('website_id')
        .unsigned()
        .notNullable()
        .references('website_id')
        .inTable('websites')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.string('type').notNullable()
      tbl.string('selector', 1024).notNullable()
      tbl.boolean('queryAll').defaultTo(false)
      tbl.string('regex').notNullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('selectors')
    .dropTableIfExists('websites')
};
