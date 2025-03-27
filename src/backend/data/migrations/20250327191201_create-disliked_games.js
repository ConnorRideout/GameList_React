/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .createTable('disliked_games', tbl => {
      tbl.increments('dislike_id')
      tbl.string('game_title').notNullable()
      tbl.string('dislike_reason', 4096).notNullable()
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema.dropTableIfExists('disliked_games')
};
