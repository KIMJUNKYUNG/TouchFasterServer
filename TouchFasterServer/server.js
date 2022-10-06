const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)

const { Server } = require("socket.io")
const root = new Server(server)

const mongoose = require('mongoose')

const {
    sendRoomList,
    applyNickName,
    createRoom, deleteRoom,
    joinRoom, quitRoom,
    ready, gameStart, multiGameDone, singleGameDone,
    userLogin, userLogOut,
    sendUserList, sendHighScores
} = require('./router')

const listener = async () => {

    const { MONGO_URI, PORT } = process.env

    if (!MONGO_URI) throw new Error("MONGO_URI is required!")
    if (!PORT) throw new Error("PORT is required")

    await mongoose.connect(MONGO_URI)
    // mongoose.set("debug", true)
    console.log("mongoDBConnection Done")

    root.on('connection', (clientSocket) => {
        console.log(`User connection, socketId : ${clientSocket.id}`)

        userLogin(root, clientSocket)

        clientSocket.on('nickName', (nickName) => {
            applyNickName(root, clientSocket, nickName)
        })

        clientSocket.on('createRoom', (roomName) => {
            createRoom(root, clientSocket, roomName)
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
        clientSocket.on('roomList', () => {
            sendRoomList(root, clientSocket)
        })


        clientSocket.on('ready', (isRoomOwner, isReady) => {
            ready(root, clientSocket, isRoomOwner, isReady)
        })
        clientSocket.on('gameStart', () => {
            gameStart(root, clientSocket)
        })
        clientSocket.on('gameDone', (gameDoneTime, isSingle) => {
            if (isSingle) {
                singleGameDone(root, clientSocket, gameDoneTime)
            } else {
                multiGameDone(root, clientSocket, gameDoneTime)
            }
        })

        clientSocket.on('userList', () => {
            sendUserList(root, clientSocket)
        })
        clientSocket.on('highScore', () => {
            sendHighScores(root, clientSocket)
        })

        clientSocket.on('disconnect', () => {
            userLogOut(root, clientSocket)
        })
    })

    server.listen(PORT, async () => {
        console.log(`server listening on port ${PORT}`)
    })
}

listener()