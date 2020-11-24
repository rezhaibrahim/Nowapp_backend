const responseStandard = require('../helpers/response')
const Joi = require('joi')
const upload = require('../helpers/upload')
// const paging = require('../helpers/pagination')
const { Users, Messages } = require('../models')
const { Op } = require('sequelize')
// const { APP_URL, APP_PORT } = process.env

module.exports = {
  viewUserProfile: async (req, res) => {
    const { id } = req.user
    const user = await Users.findByPk(id)

    if (user) {
      return responseStandard(res, 'User has been found!', { result: user })
    } else {
      return responseStandard(res, 'User not found!', {}, 404, false)
    }
  },
  editProfile: (req, res) => {
    const { id } = req.user
    const uploads = upload.single('image')

    const schema = Joi.object({
      name: Joi.string().min(5).max(30),
      info: Joi.string()
    })

    uploads(req, res, async (err) => {
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else {
        const image = req.file
        const { error, value } = schema.validate(req.body)
        const { info, name } = value

        if (info || name || image) {
          if (error) {
            return responseStandard(res, error.message, {}, 400, false)
          } else {
            await Users.update({
              info,
              name,
              picture: image && `/uploads/${image.filename}`
            }, {
              where: {
                id
              }
            })

            return responseStandard(res, 'Update profile successfully!', {}, 200, true)
          }
        } else {
          return responseStandard(res, 'Please enter the data you want to change!', {}, 400, false)
        }
      }
    })
  },
  sendMessage: async (req, res) => {
    const { id } = req.user
    const schema = Joi.object({
      message: Joi.string().max(255).required(),
      to: Joi.number()
    })
    const { error, value } = schema.validate(req.body)

    if (error) {
      return responseStandard(res, error.message, {}, 400, false)
    } else {
      const { message, to } = value
      const findNumber = await Users.findAll({
        where: { phone: to }
      })
      const idUser = JSON.stringify(findNumber)
      const userId = JSON.parse(idUser)
      // console.log(userId[0].id);
      if (findNumber.length === 0 || findNumber.length === undefined || findNumber.length === null) {
        return responseStandard(res, 'phone number not found!', {}, 403, false)
      } else {
        const data = {
          from_user_id: id,
          to_user_id: to,
          messages: message,
          user_id: userId[0].id
        }
        // console.log(data);
        const result = await Messages.create(data)
        console.log(result)
        return responseStandard(res, 'message send successfully', { result: result })
      }
    }
  },
  chatRoom: async (req, res) => {
    const { id } = req.user
    const { userId } = req.params
    const messageFrom = await Messages.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                user_id: id
              },
              {
                user_id: userId
              }
            ]
          },
          {
            [Op.or]: [
              {
                from_user_id: id
              },
              {
                from_user_id: userId
              }
            ]
          },
          {
            [Op.not]: [
              {
                [Op.and]: [
                  {
                    user_id: id
                  },
                  {
                    from_user_id: id
                  }
                ]
              }

            ]

          }
        ]
      }
    })
    console.log(messageFrom)

    if (messageFrom) {
      return responseStandard(res, 'message in room ready!', { result: messageFrom })
    } else {
      return responseStandard(res, 'message in room is not ready!', {}, 404, false)
    }
  },
  deleteChatRoom: async (req, res) => {
    const { id } = req.user
    const { userId } = req.params
    const messageFrom = await Messages.destroy({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                user_id: id
              },
              {
                user_id: userId
              }
            ]
          },
          {
            [Op.or]: [
              {
                from_user_id: id
              },
              {
                from_user_id: userId
              }
            ]
          },
          {
            [Op.not]: [
              {
                [Op.and]: [
                  {
                    user_id: id
                  },
                  {
                    from_user_id: id
                  }
                ]
              }

            ]

          }
        ]
      }
    })
    console.log(messageFrom)

    if (messageFrom) {
      return responseStandard(res, 'Delete message succesfully!', { result: messageFrom })
    } else {
      return responseStandard(res, 'Delete message failed!', {}, 404, false)
    }
  }
}
