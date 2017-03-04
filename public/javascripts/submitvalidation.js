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
        current_comment: null
    },

    // check if comment is valid and a tag is selected
    submit_button_click: function () {
        Validation.check_active_button();
        Validation.validate_comment();
        Validation.add_comment();
    },

    // validate comment by length
    validate_comment: function () {
        var text = ValE.comment_field.val();
        if (text.length < 2) {
            console.log("Message too short.");
        } else if (text.length > 2000) {
            console.log("Message too long");
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

    // add a new comment to the list of comments
    add_comment: function () {
        var comments = ValE.comment_container;
        var text = ValE.comment_field.val();

        //get the current time
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes();

        var new_comment = $('<div class="comment">' +
            //' <a class="avatar"> <img src="/images/avatar/small/matt.jpg"> </a>' +
                '<div class="content">' +
                    '<a class ="author">Me</a>' +
                    '<div class="metadata">'+
                        '<span class="date">' + time + '</span>' +
                    '</div>' +
                    '<div class="text">' +
                        text +
                    '</div>' +
                '</div>' +
            '</div>');

        if (ValA.current_comment === null) {
            comments.html(new_comment);
        } else {
            ValA.current_comment.append(new_comment);
        }
        ValA.current_comment = new_comment;
    }

};