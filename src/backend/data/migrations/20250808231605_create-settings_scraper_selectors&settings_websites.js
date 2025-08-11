/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('settings_websites', tbl => {
      tbl.increments('website_id')
      tbl.string('base_url').unique().notNullable()
      tbl.string('login_url')
      tbl.string('username')
      tbl.string('username_selector')
      tbl.string('password')
      tbl.string('password_selector')
      tbl.string('submit_selector')
    })
    .createTable('settings_selectors', tbl => {
      tbl.increments('selector_id')
      tbl.integer('website_id')
        .unsigned()
        .notNullable()
        .references('website_id')
        .inTable('settings_websites')
        .onUpdate('CASCADE')
        .onDelete('CASCADE')
      tbl.string('type').notNullable()
      tbl.string('selector', 1024).notNullable()
      tbl.boolean('queryAll').defaultTo(false)
      tbl.string('regex')
      tbl.boolean('limit_text').defaultTo(false)
      tbl.string('remove_regex')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('settings_selectors')
    .dropTableIfExists('settings_websites')
};
