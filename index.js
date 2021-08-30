const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});
const PORT = process.env.PORT || 5000

app.get('/', (req,res) => {
    res.sendFile(__dirname + '/app/index.html')
});

app.get('/app.js', (req, res) => {
    res.sendFile(__dirname + '/app/app.js')
});

app.get('/style.css', (req, res) => {
    res.sendFile(__dirname+"/app/style.css")
});

var typing_names = [];
var online = [];

io.on('connection', (socket) => {
    //broadcast messsage to connected users when someone connects
    socket.broadcast.emit('message', `${socket.id.substr(0,2)} connected`);
    online.push(socket.id);
    io.emit('online', online);

    socket.on('disconnect', () => {
        const i = online.indexOf(socket.id);
        if (i > -1) {
            online.splice(i, 1);
        }
        io.emit('message', `${socket.id.substr(0,2)} disconnected`);
        io.emit('online', online);
    });

    socket.on('message', (message) => {
        io.emit('message', `${socket.id.substr(0,2)}: ${message}`);
    });

    socket.on('private message', (targetId, msg) => {
        io.to(targetId).to(socket.id).emit('private message', socket.id, targetId, msg);
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

http.listen(PORT, () => console.log(`listening on ${PORT}`));