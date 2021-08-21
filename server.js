const http = require('http');
const app = require('./app');
//npm install --save  express socket.io  
const port = process.env.PORT || 3000;

const server = http.createServer(app);

//change here
const io = require('socket.io').listen(server);
io.on('connection', (socket) => {

    console.log('user connected')
    
    socket.on('join', function(restaurantID) {
        console.log(restaurantID + " is updating "  )
        socket.broadcast.emit('getCommands', restaurantID)
    });

    socket.on('disconnect', function() {
        console.log( 'user has left ')
        socket.broadcast.emit( "userdisconnect" ,' user has left')
    });

    
});


server.listen(port);