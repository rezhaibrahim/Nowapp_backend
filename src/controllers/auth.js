const { Users } = require('../models')
const { USER_KEY } = process.env
const responseStandard = require('../helpers/response')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


module.exports = {
    register: async (req, res) => {
        const schema = Joi.object({
            phone: Joi.number().min(6).required()
        })
        const { error,value } = schema.validate(req.body)

        console.log(value);
        if (error) {
            return responseStandard(res, error.message,{},400,false)
        }else{
            const { phone } = value
            const checkPhone = await Users.findAll({
                where: {phone:phone}
            })
            console.log(checkPhone.length);
            if (checkPhone.length) {
                return responseStandard(res, 'phone number already registered!',{},403,false)
            }else{
                const data ={
                    phone
                }

                const result = await Users.create(data)
                return responseStandard(res, 'Create user successfully', { result: result })
            }
        }
    },
    login: async (req, res) => {
        const data = Object.keys(req.body)
        if (data[0] === 'phone') {
            const schema =Joi.object({
                phone: Joi.number().required()
            })
            const {error,value} = schema.validate(req.body)
            if (error) {
                return responseStandard(res, error.message, {}, 400, false)
            }else{
                const { phone } = value
                const cekPhone = await Users.findAll({
                    where:{ phone:phone}
                })

                if (cekPhone.length) {
                    jwt.sign({ id: cekPhone[0].dataValues.id }, USER_KEY, { expiresIn: 86400 /* Expired 24 Hours */ }, (_error, token) => {
                        return responseStandard(res, 'Login success!', { token })
                      })
                }else {
                    return responseStandard(res, 'phone number not found!', {}, 404, false)
                  }
            }
        }
    }
}