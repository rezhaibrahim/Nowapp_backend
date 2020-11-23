const { Router } = require('express')
const usersController = require('../controllers/users')
const route = Router()

route.get('/profile', usersController.viewUserProfile)
route.patch('/edit-profile', usersController.editProfile)

module.exports = route