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

    socket.on('peer:nego:needed', ({ to, offer }) => {
        console.log('peer:nego:needed', to, offer);
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer })
    })

    socket.on('peer:nego:done', ({ to, anw }) => {
        console.log({ to, anw });
        io.to(to).emit('peer:nego:final', { from: socket.id, anw })

    })
    socket.on('send:message', ({ message, socketId, room }) => {
        // console.log({ message, socketId });
        const email = socketIdToEmail.get(socketId)
        // console.log(email);
        socketIdToEmail.forEach(item => {
            console.log(item);
        })
        io.to('1').emit('send:message', { message: message, email: email })

    })


    // screen share

    socket.on('peer:screen:needed', ({ to, offer }) => {
        console.log('peer:screen:needed', to, offer);
        io.to(to).emit('peer:screen:needed', { from: socket.id, offer })
    })

    socket.on('peer:screen:done', ({ to, anw }) => {
        console.log({ to, anw });
        io.to(to).emit('peer:screen:final', { from: socket.id, anw })

    })

    socket.on("capture:screen", ({ to, offer }) => {
        console.log({ "screen capture ==========>": to, to, offer });
        io.to(to).emit('capture:screen', { from: socket.id, offer })
    })

    socket.on('stop:screen:share', ({ to }) => {
        io.to(to).emit('stop:screen:share', { from: socket.id });
    });


})