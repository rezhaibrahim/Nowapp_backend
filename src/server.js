const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const { APP_PORT, APP_IP_ADDRESS } = process.env

const authRoute = require('./router/auth')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())
app.use('/uploads', express.static('assets/uploads'))

app.use('/', authRoute)

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
  