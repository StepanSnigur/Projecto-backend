const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routers/authRouter')
const boardRouter = require('./routers/boardRouter')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use('/auth', authRouter)
app.use('/board', boardRouter)

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
