const express = require('express')
const cors = require('cors')

const gameRoutes = require('./games/games-router')
const filesystemRoutes = require('./filesystem/filesystem-router')

const { logger, errorHandler } = require('./middleware/middleware')


const server = express()

server.use(cors())
server.use(express.json())

server.use(logger)

server.use('/api', gameRoutes)
server.use('/filesystem', filesystemRoutes)

server.use(errorHandler)


server.listen(9000, () => {
  console.log('Server running on http://localhost:9000')
  console.log('Environment is', process.env.SHOWCASING ? 'showcasing' : process.env.NODE_ENV || 'showcasing')
})
