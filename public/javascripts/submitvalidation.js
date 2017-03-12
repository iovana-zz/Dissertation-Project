/**
 * Created by Iovana on 25/02/2017.
 */

// create the validation on the comment
// if validation and comment is okay then allow submit and add a new html element

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
        ValA.socket.on('chat message', function (msg) {
            Validation.add_comment(msg);
        });
    },

    elements: function () {
        return {
            // list jquery variables
            submit_button: $("#submit_button"),
            comment_field: $("#comment"),
            comment_buttons: $(".comment_type"),
            comment_container: $("#comment_list")
        }
    },

    attributes: {
        //anything that should be globally visible in the module that isn't a dom element
        current_comment: null,
        socket: io()
    },

    // check if comment is valid and a tag is selected
    submit_button_click: function () {
        Validation.check_active_button();
        var validation_result = Validation.validate_comment();
        if (typeof(validation_result) === "string") {
            Validation.add_comment(Validation.new_comment(validation_result));
        }
    },

    // validate comment by length
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
                return buttons[i].innerHTML;
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
        timestamp += second;
        var message_object = {
            second: second,
            minutes: minute,
            hour: hour,
            day: dd,
            month: mm,
            year: yyyy,
            message: message,
            timestamp: timestamp
        };

        ValA.socket.emit('chat message', message_object);
        return message_object;
    },

// add a new comment to the list of comments
    add_comment: function (message) {
        var comments = ValE.comment_container;
        var time = message.hour + ":" + message.minutes;
        var day = message.day;
        var month = message.month;
        if (message.day < 10) {
            day = '0' + day;
        }
        if (month < 10) {
            month = '0' + month;
        }
        var today = day + '/' + month + '/' + message.year;

        var new_comment = $('<div class="comment"><div class="content"><a class="author">Me</a><div class="metadata"><span class="date">' + today + "   " + time + '</span></div><div class="text">' + message.message + '</div><div class="actions"><a class="reply">Reply</a></div></div></div>');

        if (ValA.current_comment === null) {
            comments.html(new_comment);
        } else {
            ValA.current_comment.append(new_comment);
        }
        ValA.current_comment = new_comment;
    }
};