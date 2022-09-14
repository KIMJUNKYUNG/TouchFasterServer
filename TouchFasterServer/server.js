const express = require('express')
const app = express()

const { Server } = require("socket.io")
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const rooms = io.of('/')
const { getRandomFloat } = require('./utils')

var roomList = ["Test", "Test2"]

let sendRoomList = (clientSocket) => {
    console.log("Send Room List")
    clientSocket.emit('roomList', { roomList })
}

rooms.on('connection', (clientSocket) => {
    console.log("room connection")
    sendRoomList(clientSocket)

    clientSocket.on('test', (msg) => {
        console.log("Hello World : ", msg)
    })
})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})