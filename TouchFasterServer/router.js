const { Rooms, LogOnUsers } = require('./models')

function broadcastRoomList(root) {
    console.log(`braocastRoomList, RoomCounnt : ${Rooms.length}`)

    Rooms.push({
        "roomName": "TTT",
        "ownerId": "Test",
        "ownerReady": false,
        "clientId": undefined,
        "clientReady": false
    })

    // LogOnUsers.forEach(user => user.emit('roomsList', { Rooms }))
    root.emit('roomList', Rooms)
}

function createRoom(ownerSocket, roomName) {
    const socketId = clientSocket.id

    console.log(`make Room, OwnerId : ${socketId}, roomName ${roomName}`)

    ownerSocket.join(roomName)
}
function joinRoom(root, clientSocket, roomNumber) {
    const currentRoom = Rooms[roomNumber]
    const roomName = currentRoom.roomName
    const socketId = clientSocket.id

    console.log(`join Room,  : clientId : ${socketId}, roomNumber ${roomNumber}`)

    currentRoom.clientId = socketId
    clientSocket.join(roomName)

    root.to(roomName).emit("roomReady");
}
function ready(clientSocket, isRoomOwner, isReady) {
    const socketId = clientSocket.id

    console.log(`Ready, isRoomOwner : clientId : ${socketId} ${isRoomOwner}, isReady : ${isReady}`)

    let roomNumber = Rooms.findIndex(element =>
        element.ownerId === socketId ||
        element.clientId === socketId
    )
    console.log("------", roomNumber)
    if (roomNumber !== -1) {
        if (isRoomOwner) {
            Rooms[roomNumber].ownerReady = isReady
        } else {
            Rooms[roomNumber].clientReady = isReady
        }
        broadcastRoomList()
    }
}

function userLogin(clientSocket) {
    const socketId = clientSocket.id

    console.log(`User LogIn, Id : ${socketId}`)
    LogOnUsers.push(clientSocket)
}

function userLogOut(clientSocket) {
    const socketId = clientSocket.id

    console.log(`User LogOut, Id : ${socketId} `)

    let userNumber = LogOnUsers.findIndex(element => element.id === socketId)
    if (userNumber !== -1) {
        LogOnUsers.splice(userNumber, 1)
    }
}

function deleteRoom(clientSocket) {
    const socketId = clientSocket.id

    console.log(`delete Room, OwnerId : ${socketId} `)

    let roomNumber = Rooms.findIndex(element => element.ownerId === socketId)
    if (roomNumber !== -1) {
        Rooms.splice(index, 1)
        broadcastRoomList()
    }
}

module.exports = { broadcastRoomList, createRoom, createRoom, joinRoom, ready, userLogin, userLogOut, deleteRoom };