const { Router } = require('express')
const usersController = require('../controllers/users')
const route = Router()

route.get('/profile', usersController.viewUserProfile)
route.patch('/edit-profile', usersController.editProfile)
route.post('/send-message', usersController.sendMessage)
route.get('/chat-room/:userId', usersController.chatRoom)
route.delete('/delete', usersController.deleteChatRoom)
module.exports = route
