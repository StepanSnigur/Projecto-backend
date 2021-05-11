const Router = require('express')
const { check } = require('express-validator')
const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const router = new Router()

router.post('/registration', [
  check('email', 'Неправильный email').isEmail(),
  check('password', 'Пароль должен быть больше 6 символов').isLength({
    min: 6
  })
], authController.registration)
router.post('/login', authController.login)
router.get('/user', authMiddleware, authController.getUser)
router.post('/addBoard', authController.addBoardToUser)

module.exports = router
