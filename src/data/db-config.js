const knex = require('knex')
const config = require('../../knexfile')
require('dotenv').config()

const environment = process.env.KNEX_ENV || 'showcasing'

module.exports = knex(config[environment])
