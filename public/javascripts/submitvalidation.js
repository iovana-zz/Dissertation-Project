/**
 * Created by Iovana on 25/02/2017.
 */

// create the validation on the message_field
// if validation and message_field is okay then allow submit and add a new html element

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
        // bind jquery elements to variables
        ValE.submit_button.click(Validation.submit_button_click);
        ValE.comment_buttons.click(Validation.button_click);
        ValA.socket.on('chat message', function (message) {
            var element = Validation.create_jquery_object(message);
            var message_object = {message: message, element: element};
            var insert_position = ValA.comment_list.length;
            var previous_comment = ValA.current_comment;

            for (var i = ValA.comment_list.length - 1; i >= 0; --i) {
                if (message.timestamp > ValA.comment_list[i].message.timestamp) {
                    insert_position = i + 1;
                    previous_comment = ValA.comment_list[i].element;
                    break;
                }
            }

            if (previous_comment === null) {
                ValE.comment_container.html(element);
            } else {
                previous_comment.after(element);
            }

            ValA.comment_list.splice(insert_position, 0, message_object);
            if(ValA.comment_list.length === insert_position) {
                ValA.current_comment = element;
            }

        });
        // populate page with the history of messages
        ValA.socket.on('chat message list', function (message_list) {
            console.log(message_list);
            for (var i = 0; i < message_list.length; ++i) {
                Validation.add_comment(message_list[i]);
            }
        });
    },

    elements: function () {
        return {
            // list jquery variables
            submit_button: $("#submit_button"),
            comment_field: $("#message_field"),
            comment_buttons: $(".comment_type"),
            comment_container: $("#comment_list")
        }
    },

    attributes: {
        //anything that should be globally visible in the module that isn't a dom element
        current_comment: null,
        comment_list: [],
        socket: io()
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


        // create a numeric date for the timestamp
        var timestamp = yyyy; //
        timestamp = timestamp * 100 + mm;
        timestamp = timestamp * 100 + dd;
        timestamp = timestamp * 100 + hour;
        timestamp = timestamp * 100 + minute;
        timestamp = timestamp * 100 + second;
        var type = Validation.check_active_button();
        console.log(type);
        var message_object = {
            second: second,
            minutes: minute,
            hour: hour,
            day: dd,
            month: mm,
            year: yyyy,
            message: message,
            message_type: type,
            timestamp: timestamp
        };
        ValA.socket.emit('chat message', message_object);
        return message_object;
    },

    create_jquery_object: function (message) {
        var time = message.hour + ":" + message.minutes;
        var day = message.day;
        var month = message.month;
        var comment_type = message.message_type;
        var new_comment;
        if (message.day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        var today = day + '/' + month + '/' + message.year;
        if(comment_type === "comment") {
            new_comment = $('<div class="comment"><div class="content"><a class="author">Me</a><div class="metadata"><span class="date">' + today + "   " + time + '</span><div>' + comment_type + '</div></div> <div class="text">' + message.message + '</div></div></div>');
        } else {
            console.log("1");
            new_comment = $('<div class="comment"><div class="content"><a class="author">Me</a><div class="metadata"><span class="date">' + today + "   " + time + '</span><div class="rating"><i class="star icon"></i>5 stars</div><div>' + comment_type + '</div></div> <div class="text">' + message.message + '</div></div><div class="ui button icon star_button"><i class="icon star big"></i></div></div>');
        }
        return new_comment;
    },

    // add a new message_field to the list of comments
    add_comment: function (message) {
        var comments = ValE.comment_container;
        var new_comment = Validation.create_jquery_object(message);
        var message_object = {message: message, element: new_comment};
        ValA.comment_list.push(message_object);
        if (ValA.current_comment === null) {
            comments.html(new_comment);
        } else {
            ValA.current_comment.after(new_comment);
        }
        ValA.current_comment = new_comment;
        // return comment_object;
    }
};
// create object, when receiving object from server do insertion sort, also you only get the message so you must make the jquery element too