const socket = require('socket.io')

exports.listen = (server) => {
    console.log('WebSocket is Running')
    const io = socket(server)
    io.on('connection', (socket) => {
        console.log(`A connection is running @ ${socket.id}`)
        socket.on("message", (data)=>{
            console.log(data)
            socket.broadcast.emit("message", data)
        })
        socket.on("entering", (data)=>{
            console.log(data)
        })
        socket.on("exiting", (data)=>{
            console.log(data)
        })
    })
}