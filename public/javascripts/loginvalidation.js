/**
 * Created by Iovana on 16/03/2017.
 */
$(document).ready(function () {
    Login.init();
});

var ValE, ValA, Login = {
    init: function () {
        // initialising elements
        ValE = Login.elements();
        ValA = Login.attributes;
        Login.bind();
    },
    bind: function () {
        ValE.login_button.click(Login.login_button_click);

        ValA.socket.on('validation', function () {
           window.location.replace("Dissertation Project\public\forumpage.html");

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
        var user_object = Login.validate_login();
        ValA.socket.emit('login', user_object);
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


}