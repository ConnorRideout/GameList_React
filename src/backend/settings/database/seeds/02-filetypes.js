/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('filetypes').insert([
    {name: 'Images', filetypes: 'jpg, jpeg, png, gif'},
    {name: 'Executables', filetypes: 'exe, jar, swf, html, htm, url'}
  ])
};
