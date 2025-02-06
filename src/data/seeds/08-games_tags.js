const randInt = (...args) => {
  const [start, end] = args.length === 2 ? args : [0, args[0]]
  return Math.floor(Math.random() * (end + 1 - start)) + start
}

const tag_indices = Array.from({length: 24}, (_, i) => i + 1)
function generateTags(game_id) {
  const length = randInt(1, 15)
  for (let i = tag_indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tag_indices[i], tag_indices[j]] = [tag_indices[j], tag_indices[i]];
  }
  const tags = tag_indices.slice(0, length)
  return tags.map(tag_id => {return {game_id, tag_id}})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('games_tags').insert(
    Array(32).fill().map((_, idx) => generateTags(idx + 1)).flat()
  ).then(() => knex('games_tags').insert(
    Array(32).fill().map((_, idx) => generateTags(idx + 1 + 32)).flat()
  )).then(() => knex('games_tags').insert(
    Array(32).fill().map((_, idx) => generateTags(idx + 1 + 64)).flat()
  )).then(() => knex('games_tags').insert(
    Array(32).fill().map((_, idx) => generateTags(idx + 1 + 96)).flat()
  ))
};
