const { Router } = require('express')
const usersController = require('../controllers/users')
const route = Router()

route.get('/profile', usersController.viewUserProfile)
route.patch('/edit-profile', usersController.editProfile)
route.post('/send-message',usersController.sendMessage)

module.exports = route