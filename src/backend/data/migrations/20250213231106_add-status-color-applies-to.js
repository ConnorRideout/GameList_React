/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema.alterTable('status', tbl => {
    tbl.string('status_color_applies_to').defaultTo('title')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.alterTable('status', tbl =>{
    tbl.dropColumn('status_color_applies_to')
  })
};
