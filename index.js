const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routers/authRouter')

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use('/auth', authRouter)

const startServer = async () => {
  try {
    await mongoose.connect(`mongodb+srv://ProjectoCreator:My*f5SKQr@C6Xjh@cluster0.8wtc9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
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
