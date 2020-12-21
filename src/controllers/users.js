const responseStandard = require('../helpers/response')
const Joi = require('joi')
const upload = require('../helpers/upload')
const { Users, Messages } = require('../models')
const { Op } = require('sequelize')
// const io = require('../server')
const socket = require('../helpers/socket')
const pagination = require('../helpers/pagination')
// const { APP_URL, APP_PORT } = process.env

module.exports = {
  viewUserProfile: async (req, res) => {
    const { id } = req.user
    const user = await Users.findByPk(id)

    if (user) {
      return responseStandard(res, 'User has been found!', { results: user })
    } else {
      return responseStandard(res, 'User not found!', {}, 404, false)
    }
  },
  viewUserById: async (req, res) => {
    const { id } = req.params
    const user = await Users.findByPk(id)
    if (user) {
      return responseStandard(res, 'User has been found by id', { results: user })
      
    }else{
      return responseStandard(res,'User not found', {},404,false)
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
        return responseStandard(res, "error bro", {}, 400, false)
      } else {
        const image = req.file
        const { error, value } = schema.validate(req.body)
        const { info, name } = value

        if (info || name || image) {
          if (error) {
            return responseStandard(res, error.s, {}, 400, false)
          } else {
            await Users.update({
              info,
              name,
              picture: image && `/uploads/${image.filename}`
            }, {
              where: {
                id
              }
            }
            )
            // console.log(picture)

            return responseStandard(res, 'Update profile successfully!', {}, 200, true)
          }
        } else {
          return responseStandard(res, 'Please enter the data you want to change!', {}, 400, false)
        }
      }
    })
  },
  sendMessage: async (req, res) => {
    try {
      const sender = req.user.id
      // console.log(sender)
      const recipient = req.params.id
      // console.log(recipient)
      const schema = Joi.object({
        messages: Joi.string()
      })
      const { value, error } = schema.validate(req.body)
      const { messages } = value
      // console.log(messages);

      if (error) {
        return responseStandard(res, 'error', '', 400, false)
      } else {
        if (sender === recipient) {
          return responseStandard(res, "can't send messages to self", '', 400, false)
        } else {
          const changeIsLates = await Messages.update(
            {
              isLates: 0
            },
            {
              where: {
                [Op.or]: [
                  {
                    [Op.and]: [
                      { sender },
                      { recipient }
                    ]
                  },
                  {
                    [Op.and]: [
                      { sender: recipient },
                      { recipient: sender }
                    ]
                  }
                ]
              }
            })
          if (changeIsLates.length) {
            const data = {
              sender,
              recipient,
              messages,
              isLates: 1,
              unread: true
            }
            const results = await Messages.create(data)
            console.log(results)
            
            socket.io.emit(recipient.toString(), {
              sender,
              messages,
            })
            
            if (results) {
              return responseStandard(res, 'Messages has been sent', { results }, 200, true)
            } else {
              return responseStandard(res, 'Failed to send messages', '', 400, false)
            }
          } else {
            return responseStandard(res, 'Failed to update isLates', '', 400, false)
          }
        }
      }
    } catch (err) {
      console.log(err);
      return responseStandard(res, err, '', 404, false)
    }
  
  },
  getChat: async (req, res) => {
    const isMe = req.user.id
    const { id } = req.params
    // console.log(id);
    const { search, sortBy = 'createdAt', sortType = 'DESC' } = req.query
    const selectMessage = await Messages.findAll({
      where: {
        [Op.and]: [
          {
            isLates :true
          },
          {
            [Op.or]: [
              {
                sender: isMe
              },
              {
                recipient: isMe
              }
            ]
          }
        ]
      },
      include: [
        {
          model: Users,
          as: 'SenderDetails',
          attributes: {
            exclude: [

            ]
          }
        },
        {
          model: Users,
          as: 'RecipientDetails',
          attributes: {
            exclude: [
              
            ]
          }
        }
      ],
      order: [
        [sortBy, sortType]
      ]
    })
    // console.log(selectMessage)

    if (selectMessage.length) {
      const results = selectMessage[0]
      return responseStandard(res, 'message in  ready!', { results }, 200, true)
    } else {
      return responseStandard(res, 'message in  is not ready!', {}, 404, false)
    }
  },
  deleteChatRoom: async (req, res) => {
    const isMe  = req.user.id
    const { id } = req.params
    const deleteMessage = await Messages.destroy({
      where: {
        [Op.and]: [
          {
            id
          }
        ]
      }
    })
    // console.log(deleteMessage)

    if (deleteMessage > 0) {
      return responseStandard(res, 'Delete message succesfully!', { result: deleteMessage })
    } else {
      return responseStandard(res, 'Delete message failed!', {}, 404, false)
    }
  },
  chatRoom: async (req, res) => {
    try {
      const { id } = req.params
      // console.log(id);
      const isMe = req.user.id
      // console.log(isMe);
      const { search, sortBy = 'createdAt', sortType = 'DESC' } = req.query
      // console.log(req.query);
      let results = []
      let count = 0
      const path = `/users/chat-list/${id}`
      const { limit, page, offset } = pagination.pagePrep(req.query)
      if (search) {
        // console.log(count);
        ({ count, rows: results } = await Messages.findAndCountAll({
          limit,
          offset,
          where: {
            [Op.and]: [
              {
                messages: {
                  [Op.like]: `%${search}%`
                }
              },
              {
                [Op.or]: [
                  {
                    [Op.and]: [
                      {
                        sender: isMe
                      },
                      {
                        recipient: id
                      }
                    ]
                  },
                  {
                    [Op.and]: [
                      {
                        sender: id
                      },
                      {
                        recipient: isMe
                      }
                    ]
                  }
                ]
              }
            ]
          },
          include: [
            {
              model: Users,
              as: 'SenderDetails',
              attributes: {
                exclude: [

                ]
              }
            },
            {
              model: Users,
              as: 'RecipientDetails',
              attributes: {
                exclude: [
                  'id'
                ]
              }
            }
          ],
          order: [
            [sortBy, sortType]
          ]
        }))
        const pageInfo = pagination.paging(path, req, count, page, limit)
        if (results.length) {
          return responseStandard(res, `success finde chat by id:${id}`, { results, pageInfo }, 200, true)
        } else {
          return responseStandard(res, 'Search not found', { results, pageInfo }, 200, true)
        }
      } else {
        ({ count, rows: results } = await Messages.findAndCountAll({
          limit,
          offset,
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  {
                    sender: isMe
                  },
                  {
                    recipient: id
                  }
                ]
              },
              {
                [Op.and]: [
                  {
                    sender: id
                  },
                  {
                    recipient: isMe
                  }
                ]
              }
            ]
          },
          include: [
            {
              model: Users,
              as: 'SenderDetails',
              attributes: {
                exclude: [

                ]
              }
            },
            {
              model: Users,
              as: 'RecipientDetails',
              attributes: {
                exclude: [

                ]
              }
            }
          ],
          order: [
            [sortBy, sortType]
          ],
        }))
        const pageInfo = pagination.paging(path, req, count, page, limit)
        if (results.length) {
          return responseStandard(res, `Your chat with id ${id}`, { results, pageInfo }, 200, true)
        } else {
          return responseStandard(res, `You never chat with id ${id}`, { results, pageInfo }, 200, true)
        }
      }
    } catch (err) {
      return responseStandard(res, err, '', 400, false)
    }
    //   const { id } = req.user

  //   const listMessage = await Messages.findAll({
  //     where: {
  //       from_user_id: id
  //     },
  //     group: ['user_id']
  //   })
  //   // console.log(listMessage);
  //   if (listMessage) {
  //     return responseStandard(res, 'list message succesfully!', { result: listMessage })
  //   } else {
  //     return responseStandard(res, 'list message failed!', {}, 404, false)
  //   }
  },
  chatList: async (req, res) => {
    try {
      const isMe = req.user.id
      // console.log(isMe)
      const { search, sortBy = 'createdAt', sortType = 'DESC' } = req.query
      let results = []
      let count = 0
      const path = '/users/chat-list'
      const { limit, page, offset } = pagination.pagePrep(req.query)

      if (search) {
        ({ count, rows: results } = await Messages.findAndCountAll({
          limit,
          offset,
          where: {
            [Op.and]: [
              {
                messages: {
                  [Op.like]: `%${search}%`
                }
              },
              {
                [Op.or]: [
                  { sender: isMe },
                  { recipient: isMe }
                ]
              }
            ]
          },
          order: [
            [sortBy, sortType]
          ],
          include: [
            {
              model: Users,
              as: 'SenderDetails',
              attributes: {
                exclude: [

                ]
              }
            },
            {
              model: Users,
              as: 'RecipientDetails',
              attributes: {
                exclude: [

                ]
              }
            }
          ]
        }))
        const pageInfo = pagination.paging(path, req, count, page, limit)
        return responseStandard(res, 'user is found', { results, pageInfo }, 200, true)
      } else {
        ({ count, rows: results } = await Messages.findAndCountAll({
          limit,
          offset,
          where: {
            [Op.or]: [
              {
                [Op.and]: [
                  {
                    isLates: 1
                  },
                  {
                    sender: isMe
                  }
                ]
              },
              {
                [Op.and]: [
                  {
                    isLates: 1
                  },
                  {
                    recipient: isMe
                  }
                ]
              }
            ]
          },
          order: [
            [sortBy, sortType]
          ],
          include: [
            {
              model: Users,
              as: 'SenderDetails',
              attributes: {
                exclude: [

                ]
              }
            },
            {
              model: Users,
              as: 'RecipientDetails',
              attributes: {
                exclude: [

                ]
              }
            }
          ]
        }))

       
          
        const pageInfo = pagination.paging(path, req, count, page, limit)
        if (results.length) {
          return responseStandard(res, 'Your list chat', { results, pageInfo }, 200, true)
        } else {
          return responseStandard(res, 'You dont have chat yet', { results, pageInfo }, 200, true)
        }
      }
    } catch (err) {
      return responseStandard(res, `Catch: ${err}`, '', 400, false)
    }
  },
  getUser: async (req, res) => {
    const { search } = req.query
    const results = await Users.findAll({
      where: {
            phone: {
              [Op.like]: `%${search}%`
            }
      }
    }
    )
    // console.log(results);
    if (results.length > 0) {
      return responseStandard(res, `user with phone ${search}`, { results })
    } else {
      return responseStandard(res, `phone ${search} not found`, {}, 401, false)
    }
  },
  updateRead: async (req, res) => {
    const { id: recipient } = req.user
    const { id: sender } = req.params
    try {
      const changeUnreadChat = await Messages.findAll({
        where: {
          sender,
          recipient,
          unread: true
        }
      })
      if (!changeUnreadChat.length) {
        return responseStandard(res, 'all chat has been read')
      }
      await Messages.update(
        { unread: false },
        {
          where: {
            sender,
            recipient,
            unread: true
          }
        }
      )
      const readEvent = 'read ' + sender
      io.emit(readEvent, { recipient, read: true })
      return responseStandard(res, 'all recent chat has been updated to read')
    } catch (err) {
      // console.log(err)
      return responseStandard(res, err.message, { err }, 500, false)
    }
  }

}
