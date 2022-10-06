const { Rooms, LogOnUsers } = require('./models')
const { HighScore } = require("./highScore")

function sendRoomList(root, clientSocket) {
    console.log(`Send Room List, RoomCounnt : ${Rooms.length}, nickName : ${clientSocket.nickName}`)
    // LogOnUsers.forEach(user => user.emit('roomsList', { Rooms }))
    clientSocket.emit('roomList', Rooms)
}
function broadcastRoomCondition(root, roomName, roomCondition) {
    console.log(`braocast Room Condtion, RoomName : ${roomName}`)
    root.to(roomName).emit('roomCondition', roomCondition)
}
function applyNickName(root, clientSocket, nickName) {
    console.log(`applyNickname, nickName : ${nickName}`)
    const userNumber = LogOnUsers.findIndex(element => element.id === clientSocket.id)
    if (userNumber !== -1) {
        const currentUser = LogOnUsers[userNumber]
        currentUser.nickName = nickName
    }
}

function createRoom(root, ownerSocket, roomName) {
    const socketId = ownerSocket.id

    console.log(`make Room, OwnerId : ${socketId}, roomName ${roomName}`)
    Rooms.push({
        roomName,

        "ownerNickName": ownerSocket.nickName,
        "ownerId": ownerSocket.id,
        "ownerReady": false,

        "clientNickName": undefined,
        "clientId": undefined,
        "clientReady": false,

        "isFull": false
    })
    ownerSocket.join(roomName)
    broadcastRoomCondition(root, roomName, Rooms.at(-1))
}
function joinRoom(root, clientSocket, roomNumber) {
    const currentRoom = Rooms[roomNumber]
    const roomName = currentRoom.roomName
    const socketId = clientSocket.id

    console.log(`join Room,  : clientId : ${socketId}, roomNumber ${roomNumber}`)

    const userNumber = LogOnUsers.findIndex(element => element.id === socketId)
    if (userNumber !== -1) {
        currentRoom.clientNickName = LogOnUsers[userNumber].nickName
    }
    currentRoom.clientId = socketId
    currentRoom.isFull = true
    clientSocket.join(roomName)

    broadcastRoomCondition(root, roomName, currentRoom)
}
function quitRoom(root, roomName) {
    let roomNumber = Rooms.findIndex(element => element.roomName === roomName)
    console.log(`quit Room, RoomName : ${roomName} , RoomNumber : ${roomNumber}`)

    if (roomNumber !== -1) {
        const currentRoom = Rooms[roomNumber]
        currentRoom.clientNickName = undefined
        currentRoom.clientId = undefined
        currentRoom.clientReady = false
        currentRoom.isFull = false
        broadcastRoomCondition(root, roomName, currentRoom)
    }
}
function ready(root, clientSocket, isRoomOwner, isReady) {
    const socketId = clientSocket.id

    console.log(`Ready, isRoomOwner :${isRoomOwner}, clientId : ${socketId} , isReady : ${isReady}`)

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

        const roomName = currentRoom.roomName
        broadcastRoomCondition(root, roomName, currentRoom)
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

const updateHighScore = async (nickName, gameDoneTime) => {
    try {
        console.log(`Update HighScore : ${gameDoneTime}`)
        let highScore = new HighScore({
            nickName,
            gameDoneTime
        })
        await highScore.save()
    } catch (err) {
        console.log(err)
    }
}

function multiGameDone(root, clientSocket, gameDoneTime) {
    const socketId = clientSocket.id
    const roomNumber = Rooms.findIndex(element =>
        element.ownerId === socketId ||
        element.clientId === socketId
    )
    const currentRoomName = Rooms[roomNumber].roomName

    let userNumber = LogOnUsers.findIndex(element => element.id === socketId)
    const winnerNickName = LogOnUsers[userNumber].nickName

    console.log(`Game Done, Id : winner : ${winnerNickName}, Time : ${gameDoneTime}`)
    root.to(currentRoomName).emit("multiGameDone", winnerNickName, gameDoneTime)

    updateHighScore(winnerNickName, gameDoneTime)
}

function singleGameDone(root, clientSocket, gameDoneTime) {
    const socketId = clientSocket.id

    let userNumber = LogOnUsers.findIndex(element => element.id === socketId)
    const nickName = LogOnUsers[userNumber].nickName

    console.log(`Single Game Done, nickName : ${nickName}, Time : ${gameDoneTime}`)
    updateHighScore(nickName, gameDoneTime)
}

function userLogin(root, clientSocket) {
    const socketId = clientSocket.id

    console.log(`User LogIn, Id : ${socketId}`)
    LogOnUsers.push(clientSocket)
    clientSocket.emit("connection")
}

function userLogOut(root, clientSocket) {
    const socketId = clientSocket.id

    console.log(`User LogOut, Id : ${socketId} `)

    let userNumber = LogOnUsers.findIndex(element => element.id === socketId)
    if (userNumber !== -1) {
        LogOnUsers.splice(userNumber, 1)
    }
    deleteRoomWithSocket(root, clientSocket)
}

function deleteRoom(root, roomName) {


    let roomNumber = Rooms.findIndex(element => element.roomName === roomName)
    if (roomNumber !== -1) {
        console.log(`delete Room, roomNumber : ${roomNumber} `)
        const currentRoom = Rooms[roomNumber]
        let userNumber = LogOnUsers.findIndex(element => element.id === currentRoom.clientId)
        if (userNumber !== -1) {
            LogOnUsers[userNumber].emit('roomClosed')
        }
        Rooms.splice(roomNumber, 1)
    }
}

function deleteRoomWithSocket(root, clientSocket) {
    const socketId = clientSocket.id

    console.log(`delete Room With Socket, OwnerId : ${socketId} `)

    let roomNumber = Rooms.findIndex(element => element.ownerId === socketId)
    if (roomNumber !== -1) {
        Rooms.splice(roomNumber, 1)
    }
}

function sendUserList(root, clientSocket) {
    const socketId = clientSocket.id


    const logOnUsersNickNames = LogOnUsers.map(element => {
        return element.nickName
    })
    console.log(`send User List, id : ${socketId}, nickNames : ${logOnUsersNickNames}`)
    clientSocket.emit('userList', logOnUsersNickNames)
}

const sendHighScores = async (root, clientSocket) => {
    try {
        console.log(`send HighScores : ${clientSocket.nickName}`)
        const highScores = await HighScore.find()
            .sort({ gameDoneTime: 1 })

        clientSocket.emit("highScore", highScores)
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    sendRoomList,
    applyNickName,
    createRoom, deleteRoom,
    joinRoom, quitRoom,
    ready, gameStart, multiGameDone, singleGameDone,
    userLogin, userLogOut,
    sendUserList, sendHighScores
};