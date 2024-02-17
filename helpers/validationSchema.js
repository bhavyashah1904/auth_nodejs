const joi = require('@hapi/joi')

const authSchema = joi.object({
  email : joi.string().email().lowercase().required(),
  password : joi.string().min(3).max(20)
})

module.exports = {
  authSchema
}