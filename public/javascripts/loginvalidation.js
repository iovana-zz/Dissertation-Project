/**
 * Created by Iovana on 16/03/2017.
 */
$(document).ready(function () {
    Validation.init();
});

var ValE, ValA, Validation = {
    init: function () {
        // initialising elements
        ValE = Validation.elements();
        ValA = Validation.attributes;
        Validation.bind();
    },
    bind: function () {
        ValE.login_button.click(Validation.login_button_click);
        // bind jquery elements to variables
        ValE.submit_button.click(Validation.submit_button_click);
        ValE.comment_buttons.click(Validation.button_click);
        ValA.socket.on('chat message', function (message) {
            if (ValA.logged_in) {
                var element = Validation.create_jquery_object(message);
                var message_object = {message: message, element: element};
                var insert_position = ValA.comment_list.length;
                var previous_comment = ValA.current_comment;

                // if there is no previous comment insert it in the container
                if (previous_comment === null) {
                    ValE.comment_container.html(element);
                    ValA.comment_list.push(message_object);
                } else {
                    // if there is a previous comment, find where to insert it and insert it
                    for (var i = ValA.comment_list.length - 1; i >= 0; --i) {
                        if (message.timestamp > ValA.comment_list[i].message.timestamp) {
                            insert_position = i + 1;
                            ValA.comment_list.splice(insert_position, 0, message_object);
                            $(ValA.comment_list[i].element).after(element);
                            break;
                        }
                    }
                }
                ValA.current_comment = ValA.comment_list[ValA.comment_list.length - 1].element;
            }
        });
        // populate page with the history of messages
        ValA.socket.on('validated', function (message_list) {
            ValE.mainpage.toggle();
            ValE.login_page.toggle();
            ValE.comment_container.empty();
            for (var i = 0; i < message_list.length; ++i) {
                Validation.add_comment(message_list[i]);
            }


            ValE.submit_button.disabled = false;
            ValA.logged_in = true;
        });
    },
    elements: function () {
        return {
            // list jquery variables
            submit_button: $("#submit_button"),
            comment_field: $("#message_field"),
            comment_buttons: $(".comment_type"),
            comment_container: $("#comment_list"),
            login_button: $("#login_button"),
            username_field: $("#username"),
            password_field: $("#password"),
            login_page: $("#login_page"),
            mainpage: $("#mainpage")
        }
    },

    attributes: {
        current_comment: null,
        comment_list: [],
        socket: io(),
        logged_in: false
    },

    // check if message_field is valid and a tag is selected
    login_button_click: function () {
        var user_object = Validation.validate_login();
        if (user_object !== false) {
            ValA.socket.emit('login', user_object);
            ValE.submit_button.disabled = true;
        }
    },

    // validate message_field by length
    validate_login: function () {
        var username = ValE.username_field.val();
        var password = ValE.password_field.val();
        var user = {username: username, password: password};

        if (password.length < 2 || username.length < 2) {
            console.log("Username/password too short.");
            return false;
        } else if (password.length > 20 || username.length > 20) {
            console.log("Username/password too long");
            return false;
        } else {
            return user;
        }
    },
    // check if message_field is valid and a tag is selected
    submit_button_click: function () {
        Validation.check_active_button();
        var validation_result = Validation.validate_comment();
        if (typeof(validation_result) === "string") {
            Validation.add_comment(Validation.new_comment(validation_result));
        }
    },

    // validate message_field by length
    validate_comment: function () {
        var text = ValE.comment_field.val();
        if (text.length < 2) {
            console.log("Message too short.");
            return false;
        } else if (text.length > 2000) {
            console.log("Message too long");
            return false;
        } else {
            ValE.comment_field.val('');
            return text;
        }
    },

    // return active selection
    check_active_button: function () {
        var buttons = ValE.comment_buttons;
        for (var i = 0; i < buttons.length; i++) {
            if ($(buttons[i]).hasClass("active")) {
                return $(buttons[i]).attr("id");
            }
        }
    },

    // add radio button behaviour to tags
    button_click: function () {
        ValE.comment_buttons.removeClass("active");
        $(this).addClass("active");
    },

    new_comment: function (message) {
        //get the current time
        var dt = new Date();
        var second = dt.getSeconds();
        var hour = dt.getHours();
        var minute = dt.getMinutes();
        var dd = dt.getDate();
        var mm = dt.getMonth() + 1; //January is 0!
        var yyyy = dt.getFullYear();
        var author = ValE.username_field.val();

        // creates the message object with time, author, text, rating
        var timestamp = yyyy; //
        // create a numeric date for the timestamp
        timestamp = timestamp * 100 + mm;
        timestamp = timestamp * 100 + dd;
        timestamp = timestamp * 100 + hour;
        timestamp = timestamp * 100 + minute;
        timestamp = timestamp * 100 + second;
        var type = Validation.check_active_button();
        var message_object = {
            second: second,
            minutes: minute,
            hour: hour,
            day: dd,
            month: mm,
            year: yyyy,
            message: message,
            message_type: type,
            timestamp: timestamp,
            author: author,
            rating: 0,
            raters: [author]
        };
        ValA.socket.emit('chat message', message_object);
        return message_object;
    },

    // find corresponding message, send to server and then either upvote or downvote
    upvote_button: function (button, timestamp, author) {
        if ($(button).hasClass("grey_button")) {
            ValA.socket.emit('vote', timestamp, author, true, ValE.username_field.val());
        }
        else if ($(button).hasClass("golden_button")) {
            ValA.socket.emit('vote', timestamp, author, false, ValE.username_field.val());
        }

        $(button).toggleClass("golden_button");
        $(button).toggleClass("grey_button");
    },

    create_jquery_object: function (message) {
        var minutes = message.minutes;
        var day = message.day;
        var month = message.month;
        var comment_type = message.message_type;
        var new_comment;
        var author = message.author;
        if (message.day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        var time = message.hour + ":" + minutes;

        var today = day + '/' + month + '/' + message.year;
        if (comment_type === "comment") {
            new_comment = $('<div class="comment">' +
                '<div class="content">' +
                '<div class="metadata">' +
                '<div class="author"><b>' + author + '</b></div>' +
                '<span class="date">' + today + "   " + time + '</span>' +
                '<div>' + comment_type + '</div>' +
                '</div>' +
                '<div class="text comment_text"><p>' + message.message + '</p></div></div></div>');
        } else {
            // author automatically votes for own comment
            new_comment = $('<div class="comment">' +
                '<div class="content">' +
                '<div class="metadata">' +
                '<div class="author"><b>' + author + '</b></div>' +
                '<span class="date">' + today + "   " + time + '</span>' +
                '<div class="rating"></div>' +
                '<div>' + comment_type + '</div></div>' +
                '<div class="text comment_text"><p>' + message.message + '</p></div></div>' +
                '<div class="ui button icon star_button">' +
                '<i class="icon star big grey_button" onclick="Validation.upvote_button(this,' + message.timestamp + ',\'' + author.toString() + '\')"></i>' +
                '</div></div>');
        }
        return new_comment;
    },

    // add a new message_field to the list of comments
    add_comment: function (message) {
        var comments = ValE.comment_container;
        var new_comment = Validation.create_jquery_object(message);
        var message_object = {message: message, element: new_comment};
        ValA.comment_list.push(message_object);
        var username = ValE.username_field.val();

        // if the user is in the list of voters find the div of the comment and make it gold
        if(message.raters.indexOf(username) !== -1) {
            new_comment.find("i").removeClass("grey_button").addClass("golden_button");
        }
        if (ValA.current_comment === null) {
            comments.html(new_comment);
        } else {
            ValA.current_comment.after(new_comment);
        }
        ValA.current_comment = new_comment;
    }
};