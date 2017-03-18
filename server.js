var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var pg = require('pg'); // postgresql database
var message_list = [];

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/" + "public/loginpage.html");
});

app.get('/forum.html', function (req, res) {
    res.sendFile(__dirname + "/" + "public/forumpage.html");
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
    socket.on('login', function (login_details) {
        var name = login_details.username;
        var key = login_details.password;
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            // select the username and the password if they exist
            var sql = 'SELECT username, password FROM user_table WHERE username=$1 AND password=$2;'
            var params = [name, key];
            client.query(sql, params, function (err, result) {
                done();
                if (err) {
                    console.error(err);
                } else {
                    if (result.rowCount === 0) {
                        insert_user(client);
                    }
                    // else {
                    //     console.log(result.rows[0]);
                    // }
                    // send message list after the login details are validated
                    // console.log(name + " " + key);
                    socket.emit('validated', message_list);
                }
            });
            function insert_user(client) {
                sql = 'INSERT INTO user_table (username, password) VALUES ($1, $2)';
                console.log(name + " " + key);
                params = [name, key];
                client.query(sql, params, function (err, result) {
                    done();
                    if (err) {
                        console.error(err);
                    }
                    // else {
                    //     console.log(result);
                    // }
                });
            }
        });
    });
    socket.on('vote', function(timestamp, author, upvote) {
        // find message in the list
        // check if the event is to upvote or downvote
        for(var i=0; i < message_list.length; i++) {
            if(message_list[i].author === author && message_list[i].timestamp === timestamp) {
                if(upvote === true) {
                    message_list[i].rating++;
                } else if (upvote === false) {
                    message_list[i].rating--;
                }
            }
        }
        console.log(message.rating);
        // in case I want to show the upvotes to the client
        // socket.broadcast.emit('vote', timestamp, author, rating);
    });

});

var port = process.env.PORT || 8080;
http.listen(port, function () {
    console.log('Running on http://localhost:' + port);
});