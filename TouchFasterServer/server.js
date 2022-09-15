const express = require('express')
const app = express()

const { Server } = require("socket.io")
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const root = {
    "Home": io.of('/'),
    "rooms": ["Test1", "Test2"]
}
const { getRandomFloat } = require('./utils')

let sendRoomList = (clientSocket) => {
    console.log("Send Room List : ", root["rooms"])
    clientSocket.emit('roomList', root["rooms"])
}

root["Home"].on('connection', (clientSocket) => {
    console.log("room connection")
    sendRoomList(clientSocket)

    clientSocket.on('makeRoom', (roomName) => {
        console.log("makeRoom : ", roomName)
        root["rooms"].push(roomName)
        sendRoomList(clientSocket)
    })
})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})