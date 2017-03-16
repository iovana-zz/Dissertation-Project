/**
 * Created by Iovana on 16/03/2017.
 */
$(document).ready(function () {
    Validation.init();
});

var ValE, Validation = {
    init: function () {
        // initialising elements
        ValE = Validation.elements();
        Validation.bind();
    },
    bind: function () {
        ValA.socket.on('login', function (message) {

        });
    },
    elements: function () {
        return {
            login_button: $("#login_button"),
            username_field: $("#username"),
            password_field: $("#password")
        }
    },
    attributes: {
        socket: io()
    },

    // check if message_field is valid and a tag is selected
    login_button_click: function () {
        Validation.validate_login();
        var user = Validation.validate_comment();

    },

    // validate message_field by length
    validate_login: function () {
        var username = ValE.username_field.val();
        var password = ValE.username_field.val();
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


}