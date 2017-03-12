var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile( __dirname + "/" + "public/forumpage.html" );
});

// app.get('/forum.html', function (req, res) {
//     res.sendFile( __dirname + "/" + "public/forumpage.html" );
// });

// registers a new handler for the event 'chat message'
io.on('connection', function(socket){
    console.log('Client connected...');
    socket.on('chat message', function(socket){
        var my_socket = socket;
        return function(msg){
            // send message to all connected clients
            my_socket.broadcast.emit('chat message', msg);
        }
    }(socket));
});

app.get('/process_get', function (req, res) {
    // Prepare output in JSON format
    response = {
        username:req.query.username,
        password:req.query.password
    };
    console.log(response);
    res.end(JSON.stringify(response));
});

var port = process.env.PORT || 8080;
http.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});