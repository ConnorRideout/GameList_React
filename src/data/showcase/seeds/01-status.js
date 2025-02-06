/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('status').insert([
    {status_name: 'Abandoned', status_priority: 3, status_color: '#C80000'},
    {status_name: 'Completed', status_priority: 2, status_color: '#FFFFFF'},
    {status_name: 'Favorite', status_priority: 1, status_color: '#FFD700'},
    {status_name: 'Watching', status_priority: 4, status_color: '#99FF99'},
  ])
};
