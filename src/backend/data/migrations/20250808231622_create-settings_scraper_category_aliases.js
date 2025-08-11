/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('settings_scraper_category_aliases', tbl => {
      tbl.increments('category_alias_id')
      tbl.integer('website_id')
        .unsigned()
        .notNullable()
        .references('website_id')
        .inTable('settings_websites')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.string('website_tag')
        .notNullable()
      tbl.integer('category_option_id')
        .unsigned()
        .notNullable()
        .references('option_id')
        .inTable('category_options')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('settings_scraper_category_aliases')
};
