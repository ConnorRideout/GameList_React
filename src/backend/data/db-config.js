const knex = require('knex')
const config = require('../../../knexfile')
require('dotenv').config()

const environment = process.env.SHOWCASING ? 'showcasing' : process.env.NODE_ENV || 'showcasing'

const gamesdb = knex(config[environment])
// const settingsdb = knex(config.settings)
// const settingsdb = new Proxy(gamesdb, {
//   apply(target, thisArg, argumentsList) {
//     const tableName = argumentsList[0]
//     if (!tableName) {
//       return target.apply(thisArg, argumentsList)
//     }
//     const prefixedTableName = `settings_${tableName}`
//     return target(prefixedTableName)
//   }
// })

module.exports = {
  gamesdb,
  settingsdb: gamesdb
}
