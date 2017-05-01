'use strict';

var path = require('path');

var express = require('express');
var config = require('config/index');
var Router = express.Router();



module.exports = function (app) {
    //app.use('/', passport.initialize());
    //app.use('/', passport.session());

    app.get('/', function (req, res) {
        res.send("Horse tranquilizers are expensive.");
    });

    app.get('/says', function (req, res) {
        res.send("Hello!");
    })
};
