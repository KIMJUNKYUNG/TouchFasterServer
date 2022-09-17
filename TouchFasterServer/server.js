const express = require('express')
const app = express()

const { Server } = require("socket.io")
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const Home = io.of('/')
const rooms = [
    {
        "roomName": "Hello",
        "owner": "Tester",
        "opponent": "Junkyung"
    }
]

const { getRandomFloat } = require('./utils')

let broadcastRoomList = () => {
    console.log("send Room List, ", rooms)
    Home.emit('roomList', { rooms })
}

function makeRoom(ownerSocket, roomName) {
    console.log(`make Room, OwnerId : ${ownerSocket.id}, roomName ${roomName}`)
    // ownerSocket.join(roomName)
    rooms.push({
        roomName, ownerSocket,
        "opponent": undefined
    })
}


function deleteRoom(ownerId) {
    // console.log(`delete Room, OwnerId : ${ownerId} `)
    // let index = rooms.findIndex(element => element.owner.id === ownerId)
    // if (index !== -1) {
    //     rooms.splice(index, 1)
    //     broadcastRoomList()
    // }
}

Home.on('connection', (clientSocket) => {
    console.log(`room connection, socketId : ${clientSocket.id}`)
    broadcastRoomList()

    clientSocket.on('makeRoom', (roomName) => {
        console.log("makeRoom, rooName : ", roomName)
        // clientSocket.join('Hello')
        makeRoom(clientSocket, roomName)
        // broadcastRoomList()
    })
    clientSocket.on('test', () => {
        Home.to('Hello').emit("test", "World")
    })

    clientSocket.on('joinRoom', (roomNumber) => {

    })
    clientSocket.on('disconnect', () => {
        console.log(`Disconnect, socektId : ${clientSocket.id}`)
        deleteRoom(clientSocket.id)
    })
    clientSocket.on('ready', () => {
        console.log(`Ready, socketId : ${clientSocket.id}`)
    })
})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})