const { parseWebSocketUrl, mockResolve } = require('../utils')
const boardController = require('../controllers/boardController')

const startWebSocketServer = () => {
  let connectedUsers = []
  
  return (ws, req) => {
    const socketParams = parseWebSocketUrl(req.url)
    if (!socketParams.id || !socketParams.boardId) return false

    const sendMessageToCurrentUser = (msg) => {
      ws.send(msg)
    }
    const currentUser = { ...socketParams, sendMessage: sendMessageToCurrentUser }
    connectedUsers.push(currentUser)

    ws.on('message', async msg => {
      try {
        const messageObj = {
          message: JSON.parse(msg),
          boardId: currentUser.boardId
        }
        const chatMessageWithId = await boardController.sendChatMessage({ body: messageObj }, mockResolve)
        const boardUsers = connectedUsers.filter(user => user.boardId === currentUser.boardId)
        boardUsers.forEach(user => {
          user.sendMessage(JSON.stringify(chatMessageWithId))
        })
      } catch (e) {
        console.error(e)
      }
    })
    ws.on('close', () => {
      connectedUsers = connectedUsers.filter(user => user.id !== currentUser.id)
    })
  }
}

module.exports = startWebSocketServer()
