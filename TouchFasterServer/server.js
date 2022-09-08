const express = require('express')
const app = express()

const { Server } = require("socket.io")
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const room = io.of('/test')
const { getRandomFloat } = require('./utils')

room.on('connection', (clientSocket) => {
    console.log("room connection")
    let randomX = getRandomFloat(0, 290, 2).toString()
    let randomY = getRandomFloat(0, 744, 2).toString()
    room.emit("test", { x: randomX, y: randomY })
    clientSocket.on('test', (msg) => {
        console.log(msg)
        randomX = getRandomFloat(0, 290, 2).toString()
        randomY = getRandomFloat(0, 744, 2).toString()
        room.emit("test", { x: randomX, y: randomY })
    })
})

server.listen(3000, async () => {
    console.log(`server listening on port 3000`)
})