const jwt = require('jsonwebtoken')

module.exports = (roles) => function(req, res, next) {
  if (req.method === 'OPTIONS') next()

  try {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(403).json({ message: 'Пользователь не авторизован' })

    const { userBoards } = jwt.verify(token, process.env.SECRET_JWT_KEY)
    const { boardId } = req.body
    const userRoleInBoard = userBoards.find(board => board.boardId === boardId).role
    const hasAccess = roles.includes(userRoleInBoard)
    if (!hasAccess) return res.status(403).json({ message: 'У вас нет доступа' })
    next()
  } catch (e) {
    console.error(e)
    return res.status(403).json({ message: 'Пользователь не авторизован' })
  }
}
