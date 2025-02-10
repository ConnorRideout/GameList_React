/* eslint-disable no-console */

function logger(req, res, next) {
    const { method, originalUrl } = req
    const time = new Date()
    console.log(
        `REQUEST METHOD: ${method}
        REQUEST URL: ${originalUrl}
        TIMESTAMP: ${time.toLocaleString()}`
    )
    next()
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.message)
  res.status(err.status || 500).json({message: err.message})
}

module.exports = {
  logger,
  errorHandler,
}
