/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('scraper_status_aliases', tbl => {
      tbl.increments('status_alias_id')
      tbl
        .integer('website_id')
        .unsigned()
        .notNullable()
        .references('website_id')
        .inTable('websites')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl
        .string('website_tag')
        .notNullable()
      tbl
        .string('status_name')
        .notNullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('scraper_status_aliases')
};
