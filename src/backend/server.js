const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { existsSync } = require('fs')
const path = require('path')

const browserManager = require('./websites/website-browser.ts')

const gameRoutes = require('./games/games-router.ts')
const filesystemRoutes = require('./filesystem/filesystem-router.ts')
const websitesRoutes = require('./websites/websites-router.ts')
const settingsRoutes = require('./settings/settings-router.ts')

const { logger, errorHandler } = require('./middleware/middleware')

if (existsSync('../../.env')) {
  dotenv.config({path: path.resolve(__dirname, '../../.env')})
} else {
  const interval = setInterval(() => {
    if (existsSync('../../.env')) {
      dotenv.config({path: path.resolve(__dirname, '../../.env')})
      clearInterval(interval)
    }
  }, 1000)
}

const server = express()

server.use(cors())
server.use(express.json({limit: '10mb'}))

server.use(logger)

server.use('/api', gameRoutes)
server.use('/filesystem', filesystemRoutes)
server.use('/websites', websitesRoutes)
server.use('/settings', settingsRoutes)

server.use(errorHandler);


(async () => {
  try {
    await browserManager.launch()

    const backend = server.listen(9000, () => {
      console.log('Server running on http://localhost:9000')
      console.log('Environment is', process.env.SHOWCASING ? 'showcasing' : process.env.NODE_ENV || 'showcasing')
    })

    const onShutdown = async () => {
      console.log('Shutting down server...')
      await browserManager.close()
      backend.close(() => {
        console.log('Server closed')
        process.exit(0)
      })
    }

    process.on('SIGINT', onShutdown)
    process.on('SIGTERM', onShutdown)
  } catch (error) {
    console.error('Failed to launch:', error)
    process.exit(1)
  }
})()
