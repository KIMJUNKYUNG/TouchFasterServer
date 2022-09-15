const express = require('express')
const app = express()

const { Server } = require("socket.io")
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const root = {
    "Home": io.of('/'),
    "roomOwners": [],
    "rooms": []
}
const { getRandomFloat } = require('./utils')

let sendRoomList = () => {
    console.log("send Room List, ", root["rooms"])
    root["Home"].emit('roomList', root["rooms"])
}

function makeRoom(owner, roomName) {
    console.log(`make Room, OwnerId : ${owner.id}, roomName ${roomName}`)
    root["roomOwners"].push(owner)
    root["rooms"].push(roomName)
}
function deleteRoom(ownerId) {
    console.log(`delete Room, OwnerId : ${ownerId} `)
    let index = root["roomOwners"].findIndex(owner => owner.id === ownerId)
    if (index !== -1) {
        root["roomOwners"].splice(index, 1)
        root["rooms"].splice(index, 1)
        sendRoomList()
    }
}

root["Home"].on('connection', (clientSocket) => {
    console.log(`room connection, socketId : ${clientSocket}`)
    sendRoomList()

    clientSocket.on('makeRoom', (roomName) => {
        console.log("makeRoom, rooName : ", roomName)
        makeRoom(clientSocket, roomName)
        sendRoomList()
    })
    clientSocket.on('disconnect', () => {
        console.log(`Disconnect, socektId : ${clientSocket.id}`)
        deleteRoom(clientSocket.id)
    })
})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})