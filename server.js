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

io.on('connection', function(socket){
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
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