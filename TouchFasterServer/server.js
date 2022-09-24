const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)

const {
    broadcastRooms,
    createRoom, deleteRoom,
    joinRoom, quitRoom,
    ready, gameStart, gameDone,
    userLogin, userLogOut,
    sendUserList
} = require('./router')

const { Server } = require("socket.io")
const root = new Server(server)

root.on('connection', (clientSocket) => {
    console.log(`User connection, socketId : ${clientSocket.id}`)

    userLogin(root, clientSocket)
    broadcastRooms(root)

    clientSocket.on('createRoom', (roomName) => {
        createRoom(root, clientSocket, roomName)
        broadcastRooms(root)
    })

    clientSocket.on('joinRoom', (roomNumber) => {
        joinRoom(root, clientSocket, roomNumber)
    })
    clientSocket.on('quitRoom', (isRoomOwner, roomName) => {
        if (isRoomOwner) {
            deleteRoom(root, roomName)
        } else {
            quitRoom(root, roomName)
        }
    })


    clientSocket.on('ready', (isRoomOwner, isReady) => {
        ready(root, clientSocket, isRoomOwner, isReady)
    })
    clientSocket.on('gameStart', () => {
        gameStart(root, clientSocket)
    })
    clientSocket.on('gameDone', () => {
        gameDone(root, clientSocket)
    })

    clientSocket.on('userList', () => {
        sendUserList(root, clientSocket)
    })

    clientSocket.on('disconnect', () => {
        userLogOut(root, clientSocket)
    })
})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})