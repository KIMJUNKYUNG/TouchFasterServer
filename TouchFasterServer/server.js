const express = require('express')
const app = express()

const { Server } = require("socket.io")
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const rooms = []
const currentUsers = []

const { getRandomFloat } = require('./utils')

let broadcastRoomList = () => {
    console.log("send Room Count, ", rooms.length)

    io.emit('roomList', { rooms })
}

function makeRoom(ownerSocket, roomNumber, roomName) {
    console.log(`make Room, OwnerId : ${ownerSocket.id}, roomNumber : ${roomNumber}, roomName ${roomName}`)

    ownerSocket.join(roomName)
    rooms.push({
        "roomNumber": roomNumber,
        roomName,
        "owner": ownerSocket.id,
        "ownerReady": false,
        "clientReady": false
    })
}
function joinRoom(clientSocket, roomName) {
    console.log(`join Room,  : cleintId : ${clientSocket.id}, roomName ${roomName}`)

    clientSocket.join(roomName)

    io.to(roomName).emit("playerJoined");
}

function deleteRoom(ownerId) {
    console.log(`delete Room, OwnerId : ${ownerId} `)

    let index = rooms.findIndex(element => element.owner === ownerId)
    if (index !== -1) {
        rooms.splice(index, 1)
        currentUsers.splice(index, 1)
        broadcastRoomList()
    }
}

io.on('connection', (clientSocket) => {
    console.log(`room connection, socketId : ${clientSocket.id}`)

    currentUsers.push(clientSocket)
    broadcastRoomList()

    clientSocket.on('makeRoom', (roomName) => {
        let roomNumber = (rooms.length + 1).toString()
        makeRoom(clientSocket, roomNumber, roomName)
        broadcastRoomList()
    })
    clientSocket.on('joinRoom', (roomNumber) => {
        let roomName = rooms[roomNumber].roomName
        joinRoom(clientSocket, roomName)
    })
    clientSocket.on('ready', (bReady, a, b) => {
        console.log(`Ready, socketId : ${clientSocket.id}, condition : ${bReady}, ${a}, ${b}`)

    })

    clientSocket.on('disconnect', () => {
        console.log(`Disconnect, socektId : ${clientSocket.id}`)
        deleteRoom(clientSocket.id)
    })

})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})