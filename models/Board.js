const { Schema, model } = require('mongoose')

const Board = new Schema({
  actions: [],
  assignedUsers: [{ userId: String, name: String, role: String }],
  backgroundImage: { type: String, default: '' },
  lists: [{
    name: String,
    tasks: [{
      createdAt: String,
      name: String,
      description: String,
      completed: Boolean
    }]
  }],
  settings: {
    isPrivate: { type: String, default: 'false' },
    comments: { type: String, default: 'disabled' }
  },
  chat: {
    messages: [{ sender: String, sendedAt: String, content: String }]
  },
  name: String
})

module.exports = model('Board', Board)
