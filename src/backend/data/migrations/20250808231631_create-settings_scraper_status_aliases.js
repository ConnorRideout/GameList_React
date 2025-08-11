/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('settings_scraper_status_aliases', tbl => {
      tbl.increments('status_alias_id')
      tbl.integer('website_id')
        .unsigned()
        .notNullable()
        .references('website_id')
        .inTable('settings_websites')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.string('website_tag')
        .unique()
        .notNullable()
      tbl.integer('status_id')
        .unsigned()
        .notNullable()
        .references('status_id')
        .inTable('status')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('settings_scraper_status_aliases')
};
