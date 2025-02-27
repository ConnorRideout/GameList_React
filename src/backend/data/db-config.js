const knex = require('knex')
const config = require('../../../knexfile')
require('dotenv').config()

const environment = process.env.SHOWCASING ? 'showcasing' : process.env.NODE_ENV || 'showcasing'

const gamesdb = knex(config[environment])
const settingsdb = knex(config.settings)

module.exports = {
  gamesdb,
  settingsdb
}
