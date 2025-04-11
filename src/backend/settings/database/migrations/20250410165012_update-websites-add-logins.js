/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex.schema
    .alterTable('websites', tbl => {
      tbl.string('login_url')
      tbl.string('username')
      tbl.string('username_selector')
      tbl.string('password')
      tbl.string('password_vi')
      tbl.string('password_selector')
      tbl.string('submit_selector')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
  return knex.schema
    .alterTable('websites', tbl => {
      tbl.dropColumn('login_url')
      tbl.dropColumn('username')
      tbl.dropColumn('username_selector')
      tbl.dropColumn('password')
      tbl.dropColumn('password_vi')
      tbl.dropColumn('password_selector')
      tbl.dropColumn('submit_selector')
    })
};
