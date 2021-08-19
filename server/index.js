const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/app/index.html')
});

app.get('/app.js', (req, res) => {
    res.sendFile(__dirname + '/app/app.js')
});

var typing_names = [];

io.on('connection', (socket) => {
    //broadcast messsage to connected users when someone connects
    socket.broadcast.emit('message', `${socket.id.substr(0,2)} connected`);

    socket.on('disconnect', () => {
        io.emit('message', `${socket.id.substr(0,2)} disconnected`);
    });

    socket.on('message', (message) => {
        io.emit('message', `${socket.id.substr(0,2)}: ${message}`);
    });

    socket.on('typing', (name) => {
        typing_names.push(name);
        socket.broadcast.emit('typing', typing_names);
    });

    socket.on('not_typing', (name) => {
        const index = typing_names.indexOf(socket.id);
        if (index > -1) {
            typing_names.splice(index,1);
        }

        if (typing_names.length == 0) {
            socket.broadcast.emit('typing', '');
        } else {
            socket.broadcast.emit('typing', typing_names);
        }
    });

});

http.listen(8080, () => console.log('listening on http://localhost:8080'));