const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)

const { broadcastRoomList: broadcastRooms, createRoom, joinRoom, ready, userLogin, userLogOut, deleteRoom } = require('./router')

const { Server } = require("socket.io")
const root = new Server(server)

root.on('connection', (clientSocket) => {
    console.log(`User connection, socketId : ${clientSocket.id}`)

    userLogin(clientSocket)
    broadcastRooms(root)

    clientSocket.on('createRoom', (roomName) => {
        createRoom(clientSocket, roomName)
        broadcastRooms(root)
    })
    clientSocket.on('joinRoom', (roomNumber) => {
        joinRoom(root, clientSocket, roomNumber)
    })
    clientSocket.on('ready', (isRoomOwner, isReady) => {
        ready(clientSocket, isRoomOwner, isReady)
    })

    clientSocket.on('disconnect', () => {
        console.log(`Disconnect, socektId : ${clientSocket.id}`)
        deleteRoom(root, clientSocket)
        userLogOut(clientSocket)
    })
})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})