const Board = require('../models/Board')

class BoardController {
  async createBoard(req, res) {
    try {
      const { name, members, backgroundImage } = req.body
      const candidate = await Board.findOne({ name })
      if (candidate) {
        return res.status(200).json({ message: 'Таблица с таким именем уже существует' })
      }
      
      const board = new Board({
        name,
        actions: [],
        assignedUsers: members,
        backgroundImage,
        lists: []
      })
      await board.save()
      res.json(board)
    } catch (e) {
      console.error(e)
    }
  }
}

module.exports = new BoardController()
