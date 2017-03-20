// listen for connection
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

// insert the previously stored message in the message list
pg.connect(process.env.DATABASE_URL, function (err, client, done) {
    var sql = 'SELECT json_message FROM json_message_table;';
    client.query(sql, function (err, result) {
            done();
            if (err) {
                console.error(err);
            } else {
                for (var i = 0; i < result.rowCount; i++) {
                    console.log("the rows of the database are: ");
                    console.log(result.rows[0]);
                    console.log("json object after parse is: ");
                    var message = result.rows[i].json_message;
                    insert_message_into_list(message);
                }
            }

        }
    );
});

// insert message into list according to the timestamp
function insert_message_into_list(message) {
    var insert_position = 0;
    for (var i = message_list.length - 1; i >= 0; --i) {
        if (messageg.timestamp > message_list[i].timestamp) {
            insert_position = i + 1;
            break;
        }
    }
    message_list.splice(insert_position, 0, message);
}

// insert the json message in the database
function insert_message_into_database(message) {
    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
        var sql = 'INSERT INTO json_message_table (json_message) VALUES ($1)';
        var message_to_json = JSON.stringify(message);
        var params = [message_to_json];
        client.query(sql, params, function (err, result) {
            done();
            if (err) {
                console.error(err);
            }
        });
    });
}

io.on('connection', function (socket) {
    socket.lecturer = false;
    console.log('Client connected...');
    socket.on('chat message', function (message) {
        insert_message_into_list(message);
        insert_message_into_database(message);
        for (var other_socket in io.of('/').connected) {
            other_socket = io.of('/').connected[other_socket];
            if (other_socket.lecturer == false && other_socket.id !== socket.id) {
                other_socket.emit('chat message', message);
            }
        }
    });
    socket.on('login', function (login_details) {
        var name = login_details.username;
        var key = login_details.password;
        pg.connect(process.env.DATABASE_URL, function (err, client, done) {
            // lecturer has username and password assigned beforehand
            // select the username and the password if they exist
            var sql = 'SELECT username, password FROM user_table WHERE username=$1 AND password=$2;';
            var params = [name, key];
            client.query(sql, params, function (err, result) {
                done();
                if (err) {
                    // only send messages with threshold
                    console.error(err);
                } else {
                    var messages_to_send = [];
                    if (name === "lecturer" && key === "comp-module") {
                        socket.lecturer = true;
                        for (var i = 0; i < message_list.length; i++) {
                            // current threshold is 5
                            if (message_list[i].rating >= threshold) {
                                messages_to_send.push(message_list[i]);
                            }
                        }
                    } else {
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


    socket.on('vote', function (timestamp, author, upvote, voter) {
        // find message in the list
        for (var i = 0; i < message_list.length; i++) {
            if (message_list[i].author === author && message_list[i].timestamp === timestamp) {
                // check if the event is to upvote or downvote
                if (upvote && message_list[i].raters.indexOf(voter) === -1) {
                    message_list[i].rating++;
                    message_list[i].raters.push(voter);
                    console.log("user voted " + voter);
                } else {
                    console.log("user already voted " + voter);
                    // if a message reached the threshold the message will be sent to the lecturer
                    if (message_list[i].rating < threshold && message_list[i].raters.indexOf(voter) !== -1) {
                        message_list[i].rating--;
                        message_list[i].raters.splice(message_list[i].raters.indexOf(voter), 1);
                        console.log("user unvoted " + voter);
                    }
                }
                // get the socket for all connected clients
                for (var other_socket in io.of('/').connected) {
                    other_socket = io.of('/').connected[other_socket];
                    if (other_socket.lecturer) {
                        if (message_list[i].rating === threshold && message_list[i].rating - 1 < threshold) {
                            other_socket.emit('chat message', message_list[i]);
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