'use strict';

var path = require('path');

var express = require('express');
var config = require('./config/index.js');
var Router = express.Router();
var bodyParser = require('body-parser');

var Agent = require('./lib/agent.js');
var agent = new Agent;

var actionsModule = require('./modules/actions.js');

module.exports = function (app, bot) {
    //app.use('/', passport.initialize());
    //app.use('/', passport.session());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    app.use('/webview', express.static('public'));

    app.get('/', function (req, res) {
        res.send("Horse tranquilizers are expensive.");
    });

    app.post('/ajax/saveDate', function (req, res){
        console.log('incoming data from shitty date page',req.body)
        var sender_id = req.body.sender_id,
            date = req.body.date;

        res.setHeader("Content-type", "application/json");

        agent.startBooking(sender_id, date, function(error){
            var output = {};
            if(error){
                output.status = false;
                output.message = error.message;
            } else {
                output.status = true;
                output.message = "Saul Goodman";
            }
            console.log('user id received', sender_id);
            bot.sendMessage(sender_id, "Thank you");
            res.send(JSON.stringify(output));
        });
    });

    //Optional webhook route
    // app.get('/says', function(req, res) {
    //   if (req.query['hub.mode'] === 'subscribe' &&
    //       req.query['hub.verify_token'] === "wubba_lubba_dub_dub") {
    //     console.log("Validating webhook");
    //     res.status(200).send(req.query['hub.challenge']);
    //   } else {
    //     console.error("Failed validation. Make sure the validation tokens match.");
    //     res.sendStatus(403);
    //   }
    // });
};
