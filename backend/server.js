const { Server } = require('socket.io')

const io = new Server(8000, {
    cors: true
});

const emailToSocketMap = new Map();
const socketIdToEmail = new Map();


io.on('connection', (socket) => {
    // console.log('socket connected', socket.id);

    socket.on('room:join', (data) => {
        const { email, room } = data
        emailToSocketMap.set(email, socket.id)
        socketIdToEmail.set(socket.id, email)

        // to join room

        io.to(room).emit("user:joined", { email, id: socket.id })
        socket.join(room)

        io.to(socket.id).emit('room:join', data)
    })

    socket.on("user:call", ({ to, offer }) => {
        io.to(to).emit('incoming:call', { from: socket.id, offer })
    })

    socket.on('call:accepted', ({ to, anw }) => {
        io.to(to).emit('call:accepted', { from: socket.id, anw })

    })

    socket.on('peer:nego:needed',({to,offer})=>{
        console.log('peer:nego:needed',to,offer);
        io.to(to).emit('peer:nego:needed',{from:socket.id,offer})
    })

    socket.on('peer:nego:done',({to,anw})=>{
        console.log({to,anw});
        io.to(to).emit('peer:nego:final',{from:socket.id,anw})

    })
})