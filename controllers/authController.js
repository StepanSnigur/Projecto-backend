const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const { secret } = require('../config')
const User = require('../models/User')
const Role = require('../models/Role')

const generateAccessToken = (id, userBoards) => {
  const payload = { id, userBoards }
  return jwt.sign(payload, secret, { expiresIn: '12h' })
}

class AuthController {
  async registration(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка регистрации', errors: errors.errors })
      }
      const { email, password } = req.body

      const candidate = await User.findOne({ email })
      if (candidate) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
      }

      const salt = 8
      const hashedPassword = bcrypt.hashSync(password, salt)
      const user = new User({
        email,
        password: hashedPassword,
        registeredInBoards: []
      })
      await user.save()

      return res.status(200).json(user)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Ошибка регистрации' })
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: 'Неверный email или пароль' })
      }

      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) {
        return res.status(400).json({ message: 'Неверный email или пароль' })
      }

      const token = generateAccessToken(user._id, user.registeredInBoards)
      return res.json({ token })
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Ошибка входа' })
    }
  }

  async getUser(req, res) {
    try {
      const { id } = req.body
      const user = await User.findById(id)
      res.json(user)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Непредвиденная ошибка' })
    }
  }

  async addBoardToUser(req, res) {
    try {
      const { boardId, role, userId } = req.body
      if (!userId) return res.status(400).json({ message: 'Вы не авторизованы' })

      const user = await User.findById(userId)
      if (user.registeredInBoards.some(board => board.boardId === boardId)) {
        return res.status(400).json({ message: 'Этот пользователь уже находится в доске' })
      }

      const userBoard = {
        boardId: boardId,
        role
      }
      user.registeredInBoards.push(userBoard)
      await user.save()
      res.json(user.registeredInBoards)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Непредвиденная ошибка' })
    }
  }
}

module.exports = new AuthController()
