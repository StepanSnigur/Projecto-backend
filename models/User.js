const { Schema, model } = require('mongoose')

const User = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  registeredInBoards: [{ boardId: String, role: String }]
})

module.exports = model('User', User)
