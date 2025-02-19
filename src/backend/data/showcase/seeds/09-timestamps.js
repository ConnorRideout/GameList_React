const randInt = (...args) => {
  const [start, end] = args.length === 2 ? args : [0, args[0]]
  return Math.floor(Math.random() * (end + 1 - start)) + start
}

function generateTimestamps(game_id, knex) {
  const getDateStr = hrs => `DATETIME('now', '-${hrs} hours')`
  const create_at = randInt(8760)
  const timestamps = {game_id, created_at: knex.raw(getDateStr(create_at))}
  const count = randInt(2)
  if (count) {
    const play_at = randInt(create_at)
    timestamps.played_at = knex.raw(getDateStr(play_at))
    if (count === 2) {
      const up_at = randInt(create_at)
      timestamps.updated_at = knex.raw(getDateStr(up_at))
    }
  }
  return timestamps
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = (knex) => {
  return knex('timestamps').insert(
    Array(128).fill().map((_, idx) => generateTimestamps(idx + 1, knex))
    // [
    //   {
    //     game_id: 1,
    //     created_at: knex.raw("DATETIME('now', '-1 hours')"),
    //     updated_at: knex.raw("DATETIME('now', '+2 hours')"),
    //     played_at: knex.fn.now()
    //   },
    //   {
    //     game_id: 2,
    //     created_at: knex.raw("DATETIME('now', '-2 hours')"),
    //   },
    //   {
    //     game_id: 3,
    //     created_at: knex.raw("DATETIME('now', '-3 hours')"),
    //     updated_at: knex.raw("DATETIME('now', '+2 hours')")
    //   },
    //   {
    //     game_id: 4,
    //     created_at: knex.raw("DATETIME('now', '-4 hours')"),
    //     updated_at: knex.raw("DATETIME('now', '+3 hours')"),
    //     played_at: knex.raw("DATETIME('now', '-1 hours')")
    //   },
    //   {
    //     game_id: 5,
    //     created_at: knex.raw("DATETIME('now', '-5 hours')"),
    //     played_at: knex.raw("DATETIME('now', '-2 hours')")
    //   },
    //   {
    //     game_id: 6,
    //     created_at: knex.raw("DATETIME('now', '-6 hours')"),
    //     updated_at: knex.raw("DATETIME('now', '+5 hours')")
    //   },
    //   {
    //     game_id: 7,
    //     created_at: knex.raw("DATETIME('now', '-7 hours')"),
    //     updated_at: knex.raw("DATETIME('now', '+6 hours')")
    //   },
    //   {
    //     game_id: 8,
    //     created_at: knex.raw("DATETIME('now', '-8 hours')"),
    //   }
    // ]
  )
};
