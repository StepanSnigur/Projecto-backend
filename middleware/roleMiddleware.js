const jwt = require('jsonwebtoken')
const { secret } = require('../config')

module.exports = (roles) => function(req, res, next) {
  if (req.method === 'OPTIONS') next()

  try {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(403).json({ message: 'Пользователь не авторизован' })

    const { userBoards } = jwt.verify(token, secret)
    const reqBoard = req.board
    const userRoleInBoard = userBoards.find(board => board.id === reqBoard.id).role
    const hasAccess = roles.includes(userRoleInBoard)
    if (!hasAccess) return res.status(403).json({ message: 'У вас нет доступа' })
    next()
  } catch (e) {
    console.error(e)
    return res.status(403).json({ message: 'Пользователь не авторизован' })
  }
}
