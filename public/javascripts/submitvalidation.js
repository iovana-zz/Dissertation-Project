/**
 * Created by Iovana on 25/02/2017.
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

    },

    elements: function () {
        return {

        }
    },

    attributes: {

    },


};
// create object, when receiving object from server do insertion sort, also you only get the message so you must make the jquery element too