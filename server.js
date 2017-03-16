var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg'); // postgresql database
var message_list = [];

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "public/forumpage.html");
});

// app.get('/forum.html', function (req, res) {
//     res.sendFile( __dirname + "/" + "public/forumpage.html" );
// });

app.get('/db', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
        client.query('SELECT * FROM user_table', function (err, result) {
            done();
            if(err) {
                console.error(err);
                response.send("Error " + err);
            } else {
                response.render('pages/db', {results: result.rows});
            }
        });
    });
});


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

        socket.broadcast.emit('chat message', msg);
    });

    socket.emit('chat message list', message_list);
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