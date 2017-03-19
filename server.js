var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg'); // postgresql database
var message_list = [];
var threshold = 5;
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "public/loginpage.html");
});

// listen for connection
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
    socket.on('login', function (login_details) {
        var name = login_details.username;
        var key = login_details.password;
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            // select the username and the password if they exist
            var sql = 'SELECT username, password FROM user_table WHERE username=$1 AND password=$2;';
            var params = [name, key];
            // lecturer has username and password assigned beforehand
            client.query(sql, params, function (err, result) {
                done();
                if (err) {
                    console.error(err);
                } else {
                    var messages_to_send = [];
                    // only send messages with threshold
                    if (name === "lecturer" && key === "comp-module") {
                        socket.lecturer = true;
                        for (var i = 0; i < message_list.length; i++) {
                            // current threshold is 5
                            if (message_list[i].rating >= threshold) {
                                messages_to_send.push(message_list[i]);
                            }
                        }
                    } else {
                        socket.lecturer = false;
                        messages_to_send = message_list;
                    }
                    if (result.rowCount === 0) {
                        insert_user(client);
                    }
                    socket.emit('validated', messages_to_send);
                }
            });
            function insert_user(client) {
                sql = 'INSERT INTO user_table (username, password) VALUES ($1, $2)';
                params = [name, key];
                client.query(sql, params, function (err, result) {
                    done();
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
    });


    socket.on('vote', function (timestamp, author, upvote) {
        // find message in the list
        for (var i = 0; i < message_list.length; i++) {
            if (message_list[i].author === author && message_list[i].timestamp === timestamp) {
                // check if the event is to upvote or downvote
                if (upvote) {
                    message_list[i].rating++;
                } else {
                    // if a message reached the threshold the message will be sent to the lecturer
                    if(message_list[i].rating < 5) {
                        message_list[i].rating--;
                    }
                }
                // find the socket the lecturer is on
                var arr = io.sockets.clients();
                for (var j = 0; j < arr.length; arr++) {
                    var socket = arr[j];
                    if (socket.lecturer) {
                        if(message_list[j].rating === threshold && message_list[j].rating - 1 < threshold) {
                            socket.emit('chat message', message_list[j]);
                        }
                    }
                }
                break;
            }
        }

    });

});

var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('Running on http://localhost:' + port);
});