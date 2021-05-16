const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
  if (req.method === 'OPTIONS') next()

  try {
    const token = req.headers.authorization.split(' ')[1]
    if (!token) return res.status(403).json({ message: 'Пользователь не авторизован' })

    const data = jwt.verify(token, process.env.SECRET_JWT_KEY)
    req.user = data
    next()
  } catch (e) {
    console.error(e)
    return res.status(403).json({ message: 'Пользователь не авторизован' })
  }
}
