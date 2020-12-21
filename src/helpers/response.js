module.exports = (res, message, data, status = 200, success = true) => {
  return res.status(status).send({
    success,
    message: message || 'Success',
    ...data
  })
}
