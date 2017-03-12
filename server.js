var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var message_list = [];

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "public/forumpage.html");
});

// app.get('/forum.html', function (req, res) {
//     res.sendFile( __dirname + "/" + "public/forumpage.html" );
// });

// registers a new handler for the event 'chat message'
io.on('connection', function (socket) {
    console.log('Client connected...');
    socket.on('chat message', function (msg) {
        var insert_position = 0;

        for (var i = message_list.length - 1; i >= 0; --i) {
            if (msg.timestamp > message_list[i].timestamp) {
                insert_position = i + 1;
                break;
            }
        }
        message_list.splice(insert_position, 0, msg);

        for (var i = 0; i < message_list.length; i++) {
            console.log("messages are: " + message_list[i].message);
        }
        socket.broadcast.emit('chat message', msg);
    });
});

app.get('/process_get', function (req, res) {
    // Prepare output in JSON format
    response = {
        username: req.query.username,
        password: req.query.password
    };
    console.log(response);
    res.end(JSON.stringify(response));
});

var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('Running on http://localhost:' + port);
});