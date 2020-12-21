require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {})
module.exports = io
const { APP_PORT } = process.env

const authRoute = require('./router/auth')
const usersRoute = require('./router/user')
const authMiddleware = require('../src/middlewares/auth')
const data = require('./helpers/socket')
data.io = io

app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())
app.use('/uploads', express.static('assets/uploads'))

app.use('/', authRoute)
app.use('/users', authMiddleware, usersRoute)

io.on("connection", (socket) => {
 console.log('socket connect');
});

app.get('/', async (req, res) => {
  console.log('connection success!')
  return res.status(200).send({
    message: 'connection success!'
  })
})

server.listen(APP_PORT, () => {
  const host = server.address().address
  const port = server.address().port
  console.log('App listening  http://%s:%s', host, port)
})
