const { Rooms, LogOnUsers } = require('./models')

function broadcastRooms(root) {
    console.log(`braocastRoomList, RoomCounnt : ${Rooms.length}`)
    // LogOnUsers.forEach(user => user.emit('roomsList', { Rooms }))
    root.emit('roomList', Rooms)
}

function createRoom(ownerSocket, roomName) {
    const socketId = ownerSocket.id

    console.log(`make Room, OwnerId : ${socketId}, roomName ${roomName}`)
    Rooms.push({
        roomName,
        "ownerId": ownerSocket.id,
        "ownerReady": false,
        "clientId": undefined,
        "clientReady": false
    })
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

    if (roomNumber !== -1) {
        const currentRoom = Rooms[roomNumber]
        if (isRoomOwner) {
            currentRoom.ownerReady = isReady
        } else {
            currentRoom.clientReady = isReady
        }

        const gameStartReady = currentRoom.ownerReady && currentRoom.clientReady
        const ownerNumber = LogOnUsers.findIndex(element => element.id === currentRoom.ownerId)
        console.log(`game Start Ready : ${gameStartReady}`)
        if (ownerNumber !== -1) {
            const ownerSocket = LogOnUsers[ownerNumber]
            if (gameStartReady) {
                ownerSocket.emit('gameReady', true)
            } else {
                ownerSocket.emit('gameReady', false)
            }
        }
    }
}

function gameStart(root, clientSocket) {
    const socketId = clientSocket.id
    const roomNumber = Rooms.findIndex(element =>
        element.ownerId === socketId
    )
    const currentRoomName = Rooms[roomNumber].roomName
    console.log(`game Start  : clientId : ${socketId}, roomName : ${currentRoomName}`)

    root.to(currentRoomName).emit("gameStart");
}

function gameDone(root, clientSocket) {
    const socketId = clientSocket.id
    const roomNumber = Rooms.findIndex(element =>
        element.ownerId === socketId
    )
    const currentRoom = Rooms[roomNumber]

    const opponentId = currentRoom.clientId
    if (currentRoom.clientId === socketId) {
        opponentId = currentRoom.ownerId
    }

    const opponentIndex = LogOnUsers.findIndex(element => element.id === opponentId)
    const opponent = LogOnUsers[opponentIndex]
    clientSocket.emit('win')
    opponent.emit('lose')
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

function deleteRoom(root, clientSocket) {
    const socketId = clientSocket.id

    console.log(`delete Room, OwnerId : ${socketId} `)

    let roomNumber = Rooms.findIndex(element => element.ownerId === socketId)
    if (roomNumber !== -1) {
        Rooms.splice(roomNumber, 1)
        broadcastRooms(root)
    }
}

module.exports = {
    broadcastRooms,
    createRoom, deleteRoom, joinRoom,
    ready, gameStart, gameDone,
    userLogin, userLogOut
};