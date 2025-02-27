/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('filetypes', tbl => {
      tbl.increments('filetype_id')
      tbl.string('name').unique().notNullable()
      tbl.string('filetypes').notNullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('filetypes')
};
