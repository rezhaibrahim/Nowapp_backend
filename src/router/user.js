const { Router } = require('express')
const usersController = require('../controllers/users')
const route = Router()

route.post('/send-message/:id', usersController.sendMessage)
route.get('/chat/:id', usersController.getChat)
route.get('/chat-Room/:id', usersController.chatRoom)
route.delete('/delete/:id', usersController.deleteChatRoom)
route.get('/chat-list', usersController.chatList)
route.get('/search-user', usersController.getUser)
route.patch('/read/:id', usersController.updateRead)

route.get('/profile', usersController.viewUserProfile)
route.get('/profile/:id', usersController.viewUserById)
route.patch('/edit-profile', usersController.editProfile)
module.exports = route
