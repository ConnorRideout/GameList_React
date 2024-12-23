const express = require('express')

const server = express()

server.listen(9000, () => {
  console.log('Server running on http://localhost:9000')
})
