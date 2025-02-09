const express = require('express')
const cors = require('cors')

const gameRoutes = require('./games/games-router')
const filesystemRoutes = require('./filesystem/filesystem-router')


const server = express()

server.use(cors())
server.use(express.json())

server.use('/api', gameRoutes)
server.use('/filesystem', filesystemRoutes)

server.listen(9000, () => {
  console.log('Server running on http://localhost:9000')
})
