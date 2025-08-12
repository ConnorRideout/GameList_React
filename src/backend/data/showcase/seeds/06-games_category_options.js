const randInt = (...args) => {
  const [start, end] = args.length === 2 ? args : [0, args[0]]
  return Math.floor(Math.random() * (end + 1 - start)) + start
}

function generateOptions(game_id) {
  return [
    { game_id, option_id: randInt(1, 4) },
    { game_id, option_id: randInt(5, 13) },
    { game_id, option_id: randInt(14, 22) },
    { game_id, option_id: randInt(23, 27) },
    { game_id, option_id: randInt(28, 33) },
  ]
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('games_category_options').insert(
    Array(64).fill().map((_, idx) => generateOptions(idx + 1)).flat()
  ).then(() => knex('games_category_options').insert(
    Array(64).fill().map((_, idx) => generateOptions(idx + 1 + 64)).flat()
  ))
};
