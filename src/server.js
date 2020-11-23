const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const { APP_PORT, APP_IP_ADDRESS } = process.env


app.get('/', async (req, res) => {
    console.log('connection success!')
    return res.status(200).send({
      message: 'connection success!'
    })
  })

  const server = app.listen(APP_PORT, APP_IP_ADDRESS, () => {
    const host = server.address().address
    const port = server.address().port
    console.log('App listening  http://%s:%s', host, port)
  })
  