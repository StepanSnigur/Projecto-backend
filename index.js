const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const enableWs = require('express-ws')
const authRouter = require('./routers/authRouter')
const boardRouter = require('./routers/boardRouter')
const boardChatSocket = require('./websocket/boardChat')
require('dotenv').config()

const app = express()
enableWs(app)
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cors())
app.use('/auth', authRouter)
app.use('/board', boardRouter)

app.ws('/boardChat', boardChatSocket)

const startServer = async () => {
  try {
    await mongoose.connect(`mongodb+srv://ProjectoCreator:${process.env.DB_PASSWORD}@cluster0.8wtc9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    app.listen(PORT, () => console.log('Server started on port: ', PORT))
  } catch (e) {
    console.error(e)
  }
}

startServer()
