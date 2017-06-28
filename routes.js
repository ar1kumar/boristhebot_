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
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    app.use('/webview', express.static('public'));

    app.get('/', function (req, res) {
        res.send("Horse tranquilizers are expensive.");
    });

    app.post('/ajax/getBooking', function(req, res){
        var sender_id = req.body.sender_id;

        agent.getBooking(sender_id, function(error, booking, court){
            var output = {};
            if(error){
                output.status = false;
                output.message = error.message;
            } else {
                output.status = true;
                output.message = "Saul Goodman";
            }
            output.booking = booking;
            output.court = court;

            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(output));
        });
    });

    app.post('/ajax/availableTimes', function (req, res){
        var court_id = req.body.court_id,
            date = req.body.date,
            approx = req.body.approx;

        agent.checkCourtTimes(date, approx, court_id, function(error, availableTimes){
            var output = {};
            if(error){
                output.status = false;
                output.message = error.message;
                output.times = [];
            } else {
                output.status = true;
                output.message = "Saul Goodman";
                output.times = availableTimes;
            }
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(output));
        });
    });

    app.post('/ajax/chooseTime', function (req, res){
        var sender_id = req.body.sender_id,
            bookingTime = req.body.bookingTime;

        // Do something
        //
        //
        //

        var output = {};
            output.status = true;
            output.message = "Saul Goodman";

        res.setHeader("Content-type", "application/json");
        res.send(JSON.stringify(output));
    });

    app.post('/ajax/saveDate', function (req, res){
        var sender_id = req.body.sender_id,
            date = req.body.date,
            time = req.body.time;
        agent.startBooking(sender_id, date, function(error){
            var output = {};
            if(error){
                output.status = false;
                output.message = error.message;
            } else {
                output.status = true;
                output.message = "Saul Goodman";
                console.log('user id received', sender_id);
                //var text = "Thank you. You have selected " + date + " at "+time+".";
                console.log('Date selected', date);
                bot.sendGenericTemplate(sender_id, [{ 
                   "title": "Thank you. You have selected " + date,
                   "subtitle":"",
                   "buttons":[{
                     "type":"web_url",
                     "url":"https://sportingbot.forever-beta.com/webview/date.html",
                     "title":"Change date",
                     "webview_height_ratio": "compact",
                     "messenger_extensions": true,
                     "fallback_url" : "https://sportingbot.forever-beta.com/webview/date_fallback.html?uid="+sender_id,
                     "webview_share_button" : "hide"
                   },
                   {
                    "type":"postback",
                    "title":"Looks good",
                    "payload": date+"#"+time
                    }
                  ]
                 }])
                // bot.sendTextMessage(sender_id, text, [
                //   {
                //     "content_type":"text",
                //     "title":"Looks Good",
                //     "payload":date+"#"+time
                //   },
                //   {
                //     "content_type":"text",
                //     "title":"Nah, I wanna change",
                //     "payload": "edit_date"
                //   }
                // ]);
            }
            res.setHeader("Content-type", "application/json");
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
