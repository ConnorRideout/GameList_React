/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('scraper_tag_aliases', tbl => {
      tbl.increments('tag_alias_id')
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
        .unique()
        .notNullable()
      tbl
        .string('tag_name')
        .notNullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('scraper_tag_aliases')
};
