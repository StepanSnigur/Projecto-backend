const Router = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const boardController = require('../controllers/boardController')
const router = new Router()

router.post('/create', authMiddleware, boardController.createBoard)

module.exports = router