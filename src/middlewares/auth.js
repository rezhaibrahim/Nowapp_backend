const jwt = require('jsonwebtoken')
const responseStandart = require('../helpers/response')

module.exports = (req, res, next) => {
  const { authorization } = req.headers
  if (authorization && authorization.startsWith('Bearer ')) {
    const token = authorization.slice(7, authorization.length)
    try {
      const payload = jwt.verify(token, process.env.USER_KEY)
      console.log(payload)
      if (payload) {
        req.user = payload
        next()
      } else {
        return responseStandart(res, 'Unauthorize', {}, 401, false)
      }
    } catch (err) {
      return responseStandart(res, err.message, {}, 500, false)
    }
  } else {
    return responseStandart(res, 'Forbiden Access', {}, 403, false)
  }
}
