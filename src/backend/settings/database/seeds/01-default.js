/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('default').insert([
    {name: 'games_folder', value: ''},
    {name: 'locale_emulator', value: ''}
  ])
};
