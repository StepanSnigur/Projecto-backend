const mongoose = require('mongoose')
const Board = require('../models/Board')
const User = require('../models/User')
const authController = require('./authController')

const mockResolve = {
  status: () => ({
    json: () => {}
  }),
  json: () => {}
}

class BoardController {
  async createBoard(req, res) {
    try {
      const { name, members, backgroundImage } = req.body
      const candidate = await Board.findOne({ name })
      if (candidate) {
        return res.json({ message: 'Таблица с таким именем уже существует' })
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
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async createList(req, res) {
    try {
      const { boardId, listName } = req.body

      const board = await Board.findById(boardId)
      const newList = {
        _id: mongoose.Types.ObjectId(),
        name: listName,
        tasks: []
      }
      board.lists.push(newList)
      await board.save()
      return res.json(newList)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async createTask(req, res) {
    try {
      const { boardId, listId, createdAt, taskName } = req.body

      const board = await Board.findById(boardId)
      const newTask = {
        _id: mongoose.Types.ObjectId(),
        name: taskName,
        createdAt
      }
      board.lists.find(list => list._id.toString() === listId).tasks.push(newTask)
      await board.save()
      return res.json(newTask)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async addUser(req, res) {
    try {
      const { boardId, userId, name } = req.body

      const board = await Board.findById(boardId)
      const userInBoard = board.assignedUsers.some(user => user.userId === userId)
      if (userInBoard) {
        return res.status(400).json({ message: 'Этот пользователь уже находится в доске' })
      }

      const newBoardMember = {
        userId,
        name
      }
      board.assignedUsers.push(newBoardMember)
      await board.save()
      const userRegisteredInBoards = await authController.addBoardToUser(req, mockResolve)
      res.json({
        newBoardMember,
        userRegisteredInBoards
      })
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async changeName(req, res) {
    try {
      const { boardId, newBoardName } = req.body
      if (!boardId || !newBoardName) {
        return res.status(400).json({ message: 'Неверные данные' })
      }
      
      const board = await Board.findById(boardId)
      board.name = newBoardName
      await board.save()
      res.json(board.name)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }


  async changeListName(req, res) {
    try {
      const { boardId, listId, newListName } = req.body

      const board = await Board.findById(boardId)
      const listToChange = board.lists.find(list => list._id.toString() === listId.toString())
      listToChange.name = newListName
      await board.save()
      res.json(listToChange)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async searchUsers(req, res) {
    try {
      const { term } = req.body
      if (!term || !term.length || term.length <= 3) {
        return res.status(400).json({ message: 'Некорректное значение поиска' })
      }

      const users = await User.find({ email: new RegExp('^' + term, 'i') })
      res.json(users)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async changeTaskData(req, res) {
    try {
      const { boardId, listId, taskId, newTitle, newDescription } = req.body

      const board = await Board.findById(boardId)
      const listToChange = board.list.find(list => list._id.toString() === listId)
      const taskToChange = listToChange.find(task => task._id.toString() === taskId)
      taskToChange.name = newTitle
      taskToChange.description = newDescription
      await board.save()
      res.json(taskToChange)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async getBoard(req, res) {
    try {
      const { boardId } = req.body
      const board = await Board.findById(boardId)
      res.json(board)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async saveBoardSettings(req, res) {
    try {
      const { boardId, newSettings } = req.body

      const board = await Board.findById(boardId)
      board.settings = newSettings
      await board.save()
      res.json(newSettings)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async deleteBoardMember(req, res) {
    try {
      const { boardId, memberId } = req.body

      const board = await Board.findById(boardId)
      board.assignedUsers = board.assignedUsers.filter(user => user.userId !== memberId)
      await authController.removeBoardFromUser(req, mockResolve)
      await board.save()
      res.json(board.assignedUsers)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }
}

module.exports = new BoardController()
