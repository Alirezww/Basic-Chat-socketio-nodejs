const express = require('express');
const { Server } = require('socket.io');

const http = require('http');

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("public"))

server.listen(3000, () => { console.log("The server is running on port 3000.") })

const onlineUsers = {};

io.use((socket, next) => {
    const token = socket.handshake.auth.token
    const id = 1234

    if (token == undefined) {
        console.log("Error : The User is undefined...")
    } else if (token !== id) {
        console.log("Error : The aithentication falied....")
    }

    if (token === id) {
        console.log("The user authenticated...");
        next()
    }

})

const chatNamespace = io.of("/chat")

chatNamespace.on("connection", (socket) => {

    socket.on("login", (data) => {
        console.log(`User ${data.nickname} connected.`);
        socket.join(data.chatroom);
        onlineUsers[socket.id] = { chatroom: data.chatroom, nickname: data.nickname };
        console.log("Online Users : ", onlineUsers)
        chatNamespace.emit("onlineUsers", onlineUsers);
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected.")
        delete onlineUsers[socket.id]
        chatNamespace.emit("onlineUsers", onlineUsers)
    })

    socket.on("chat message", (data) => {
        console.log(data);
        chatNamespace.to(data.chatroom).emit("chat message", data)
    })

    socket.on("typing", (data) => {
        socket.broadcast.to(data.chatroom).emit("typing", data)
    })

    socket.on("pvChat", (data) => {
        chatNamespace.to(data.to).emit("pvChat", data)
    })
})