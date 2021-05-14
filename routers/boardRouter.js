const Router = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const boardController = require('../controllers/boardController')
const router = new Router()

router.post('/create', authMiddleware, boardController.createBoard)
router.post('/createList', authMiddleware, boardController.createList)
router.post('/createTask', authMiddleware, boardController.createTask)
router.post('/addUser', authMiddleware, boardController.addUser)
router.post('/changeName', authMiddleware, roleMiddleware('ADMIN'), boardController.changeName)
router.post('/changeListName', authMiddleware, roleMiddleware('ADMIN'), boardController.changeListName)
router.post('/searchUsers', authMiddleware, boardController.searchUsers)
router.post('/changeTaskData', authMiddleware, boardController.changeTaskData)

module.exports = router