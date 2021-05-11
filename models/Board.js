const { Schema, model } = require('mongoose')

const Board = new Schema({
  actions: [],
  assignedUsers: [{ userId: String, name: String }],
  backgroundImage: { type: String, default: '' },
  lists: [{
    name: String,
    tasks: [{
      createdAt: String,
      name: String
    }]
  }],
  settings: {
    isPrivate: { type: String, default: 'false' },
    comments: { type: String, default: 'disabled' }
  }
})

module.exports = model('Board', Board)
