/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  // art, engine, genre, play_status
  return knex('categories').insert([
    {category_name: 'art'},
    {category_name: 'engine'},
    {category_name: 'genre'},
    {category_name: 'play-status'},
    {category_name: 'protagonist'},
  ]);
};
