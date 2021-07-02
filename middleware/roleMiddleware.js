const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = (roles) => async function(req, res, next) {
  if (req.method === 'OPTIONS') next()

  try {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Пользователь не авторизован' })

    const { id } = jwt.verify(token, process.env.SECRET_JWT_KEY)
    const { boardId } = req.body

    const user = await User.findById(id.toString())
    const currentBoard = user.registeredInBoards.find(board => board.boardId === boardId)
    const userRoleInBoard = currentBoard.role
    const hasAccess = roles.includes(userRoleInBoard)
    if (!hasAccess) return res.status(403).json({ message: 'У вас нет доступа' })
    next()
  } catch (e) {
    console.error(e)
    return res.status(401).json({ message: 'Пользователь не авторизован' })
  }
}
