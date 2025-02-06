const randInt = (...args) => {
  const [start, end] = args.length === 2 ? args : [0, args[0]]
  return Math.floor(Math.random() * (end + 1 - start)) + start
}

function generateStatus(game_id) {
  const stats = []
  if (randInt(2)) return null
  const count = randInt(2)
  if (!count) return null
  for (let i = 0; i < count; i++) {
    const stat = randInt(1, 4)
    if (!stats.includes(stat)) stats.push(stat)
  }
  return stats.map(status_id => {return {game_id, status_id}})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('games_status').insert(
    Array(64).fill().map((_, idx) => generateStatus(idx + 1)).flat().filter(i => i)
  //   [
  //   {game_id: 2, status_id: 2},
  //   {game_id: 3, status_id: 2},
  //   {game_id: 4, status_id: 2},
  //   {game_id: 5, status_id: 3},
  //   {game_id: 6, status_id: 3},
  //   {game_id: 7, status_id: 1},
  //   {game_id: 7, status_id: 3},
  //   {game_id: 8, status_id: 2},
  //   {game_id: 8, status_id: 3},
  // ]
  ).then(() => knex('games_status').insert(
    Array(64).fill().map((_, idx) => generateStatus(idx + 1 + 64)).flat().filter(i => i)
  ))
};
