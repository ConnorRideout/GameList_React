const express = require('express')
const gameRoutes = require('./games/games-router')

const server = express()

server.use(express.json())

server.use('/', gameRoutes)

server.listen(9000, () => {
  console.log('Server running on http://localhost:9000')
})
