const express = require('express')
const cors = require('cors')
require('dotenv').config()

const gameRoutes = require('./games/games-router.ts')
const filesystemRoutes = require('./filesystem/filesystem-router.ts')
const settingsRoutes = require('./settings/settings-router')

const { logger, errorHandler } = require('./middleware/middleware')


const server = express()

server.use(cors())
server.use(express.json({limit: '10mb'}))

server.use(logger)

server.use('/api', gameRoutes)
server.use('/filesystem', filesystemRoutes)
server.use('/settings', settingsRoutes)

server.use(errorHandler)


server.listen(9000, () => {
  console.log('Server running on http://localhost:9000')
  console.log('Environment is', process.env.SHOWCASING ? 'showcasing' : process.env.NODE_ENV || 'showcasing')
})
