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
        return res.status(400).json({ message: 'Таблица с таким именем уже существует' })
      }
      
      const board = new Board({
        name,
        actions: [],
        assignedUsers: members,
        backgroundImage,
        lists: [],
        chat: {
          messages: []
        }
      })
      members.forEach(async member => {
        await authController.addBoardToUser({
          body: {
            boardId: board._id,
            role: member.role,
            userId: member._id
          }
        }, mockResolve)
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
        createdAt,
        completed: false
      }
      console.log(newTask)
      board.lists.find(list => list._id.toString() === listId).tasks.push(newTask)
      await board.save()
      console.log(board.lists.find(list => list._id.toString() === listId).tasks)
      return res.json(newTask)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async addUser(req, res) {
    try {
      const { boardId, userId, name, role } = req.body

      const board = await Board.findById(boardId)
      const userInBoard = board.assignedUsers.some(user => user.userId === userId)
      if (userInBoard) {
        return res.status(400).json({ message: 'Этот пользователь уже находится в доске' })
      }

      const newBoardMember = {
        userId,
        name,
        role
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
      const listToChange = board.lists.find(list => list._id.toString() === listId)
      const taskToChange = listToChange.tasks.find(task => task._id.toString() === taskId)
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
      if (!board) {
        return res.status(400).json({ message: 'Такой доски не существует' })
      }

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

  async pinBoard(req, res) {
    try {
      const { userId, boardId, isPinned } = req.body

      const user = await User.findById(userId)
      const board = user.registeredInBoards.find(board => board.boardId === boardId)
      board.isPinned = isPinned
      await user.save()
      res.json(user.registeredInBoards)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async deleteBoard(req, res) {
    try {
      const { boardId } = req.body

      const board = await Board.findById(boardId)
      board.assignedUsers.forEach(async ({ userId }) => {
        req.body.memberId = userId
        await authController.removeBoardFromUser(req, mockResolve)
      })
      await Board.deleteOne({
        _id: boardId
      })
      res.json({ msg: 'deleted' })
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async moveTask(req, res) {
    try {
      const { boardId, source, destination } = req.body

      const board = await Board.findById(boardId)
      const dragFromListIndex = board.lists.findIndex(list => list._id.toString() === source.droppableId)
      const dragToListIndex = board.lists.findIndex(list => list._id.toString() === destination.droppableId)
      const taskToMove = board.lists[dragFromListIndex].tasks[source.index]
      board.lists[dragFromListIndex].tasks = board.lists[dragFromListIndex].tasks.filter((_, i) => i !== source.index)
      board.lists[dragToListIndex].tasks.splice(destination.index, 0, taskToMove)
      await board.save()
      res.json(board.lists)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }
  async moveColumn(req, res) {
    try {
      const { boardId, source, destination } = req.body
      const sourceId = source.index
      const destinationId = destination.index

      const board = await Board.findById(boardId)
      const listToMove = board.lists.splice(sourceId, 1)[0]
      board.lists.splice(destinationId, 0, listToMove)
      await board.save()
      res.json(board.lists)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async addAction(req, res) {
    try {
      const { boardId, action } = req.body
      delete req.body.__v
      action._id = mongoose.Types.ObjectId()

      const board = await Board.findById(boardId)
      await Board.updateOne(
        { _id: boardId },
        {
          $set: {
            actions: board.actions.length >= 100
              ? [action, ...board.actions.slice(0, board.actions.length - 1)]
              : [action, ...board.actions]
          }
        }
      )
      res.json(action)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async changeTaskStatus(req, res) {
    try {
      const { boardId, listId, taskId, isCompleted } = req.body

      const board = await Board.findById(boardId)
      const list = board.lists.find(list => list._id.toString() === listId)
      const task = list.tasks.find(task => task._id.toString() === taskId)
      task.completed = isCompleted
      await board.save()
      res.json(task)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async getChatMessages(req, res) {
    try {
      const { boardId } = req.body

      const board = await Board.findById(boardId)
      res.json(board.chat.messages)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }

  async sendChatMessage(req, res) {
    try {
      const { boardId, message } = req.body
      message._id = mongoose.Types.ObjectId()

      const board = await Board.findById(boardId)
      board.chat.messages.push(message)
      await board.save()
      res.json(message)
    } catch (e) {
      console.error(e)
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }
}

module.exports = new BoardController()
