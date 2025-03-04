/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('scraper_category_aliases', tbl => {
      tbl.increments('category_alias_id')
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
        .string('category_option_name')
        .notNullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('scraper_category_aliases')
};
