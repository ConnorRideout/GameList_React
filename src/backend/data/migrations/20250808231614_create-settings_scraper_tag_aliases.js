/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('settings_scraper_tag_aliases', tbl => {
      tbl.increments('tag_alias_id')
      tbl.integer('website_id')
        .unsigned()
        .notNullable()
        .references('website_id')
        .inTable('settings_websites')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.string('website_tag')
        .notNullable()
      tbl.integer('tag_id')
        .unsigned()
        .notNullable()
        .references('tag_id')
        .inTable('tags')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('settings_scraper_tag_aliases')
};
