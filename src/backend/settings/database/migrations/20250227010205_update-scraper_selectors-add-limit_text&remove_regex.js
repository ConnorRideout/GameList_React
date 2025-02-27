/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .alterTable('selectors', tbl => {
      tbl.boolean('limit_text').defaultTo(false)
      tbl.string('remove_regex')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.alterTable('selectors', tbl => {
    tbl.dropColumn('limit_text')
    tbl.dropColumn('remove_regex')
  })
};
