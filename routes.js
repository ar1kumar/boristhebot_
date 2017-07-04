'use strict';

var path = require('path');

var express = require('express');
var config = require('./config/index.js');
var Router = express.Router();
var bodyParser = require('body-parser');

var Agent = require('./lib/agent.js');
var notify = require('./modules/notification.js');
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

    app.post('/ajax/getBooking', function (req, res){
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
    app.post('/ajax/saveTime', function (req, res){
        var sender_id = req.body.sender_id,
            date = req.body.date,
            court_id = req.body.court_id,
            time = req.body.time;
        var fullDate = new Date(date + " " + time);
        agent.checkCourtAvailability(fullDate, court_id, function(error){
            var output = {};
            if(error){
                output.status = false;
                output.message = error.message;
            } else {
                output.status = true;
                output.message = "Saul Goodman";

                // *** TODO: REPLACE BELOW PLS ***

                // bot.sendGenericTemplate(sender_id, [{
                //    "title": "Thank you. You have selected " + date,
                //    "subtitle":"",
                //    "buttons":[{
                //      "type":"web_url",
                //      "url":"https://sportingbot.forever-beta.com/webview/date.html",
                //      "title":"Change date",
                //      "webview_height_ratio": "compact",
                //      "messenger_extensions": true,
                //      "fallback_url" : "https://sportingbot.forever-beta.com/webview/date_fallback.html?uid="+sender_id,
                //      "webview_share_button" : "hide"
                //    },
                //    {
                //     "type":"postback",
                //     "title":"Looks good",
                //     "payload": date+"#"+time
                //     }
                //   ]
                //  }])
            }
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(output));
        });
    });
    app.post('/ajax/checkTime', function (req, res){
        var date = req.body.date,
            court_id = req.body.court_id,
            time = req.body.time;
        var fullDate = new Date(date + " " + time);
        agent.checkCourtAvailability(fullDate, court_id, function(error){
            var output = {};
            if(error){
                output.status = false;
                output.message = error.message;
            } else {
                output.status = true;
                output.message = "Saul Goodman";

                // ** TODO: FIRE BOT RESPONSE **
            }
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(output));
        });
    });

    app.post('/ajax/updateBooking', function (req, res){
        var date = req.body.date,
            sender_id = req.body.sender_id,
            time = req.body.time;
        var fullDate = new Date(date + " " + time);
        agent.editBooking(sender_id, fullDate, function(error, booking, court){
            var output = {};
            if(error){
                output.status = false;
                output.message = error.message;
            } else {
                output.status = true;
                output.message = "Saul Goodman";
            }
            console.log("updated booking info", booking, court);
            var date = booking.bookingDate.toString().split('T')[0];
            var time = booking.bookingDate.toString().split('T')[1].split('Z')[0];
            bot.sendGenericTemplate(booking.sender_id, [{
               "title": court.name,
               "subtitle":"Date and Time: "+date,
               "image_url" : court.images[0],
               "buttons":[
                 {
                   "type":"postback",
                   "title":"Make Payment",
                   "payload":"buy_now"
                 },
                 {
                   "type":"web_url",
                   "url":"https://sportingbot.forever-beta.com/webview/booking.html",
                   "title":"Edit info",
                   "webview_height_ratio": "compact",
                   "messenger_extensions": true,
                   "fallback_url" : "https://sportingbot.forever-beta.com/webview/booking_fallback.html?uid="+booking.sender_id,
                   "webview_share_button" : "hide"
                 },
                 {
                   "type":"web_url",
                   "url":"https://sportingbot.forever-beta.com/webview/invite.html?booking_id="+booking._id+"&user_id="+booking.sender_id,
                   "title":"Invite friends",
                   "webview_height_ratio": "compact",
                   "messenger_extensions": true,
                   "fallback_url" : "https://sportingbot.forever-beta.com/webview/invite_fallback.html?booking_id="+booking._id+"&user_id="+booking.sender_id,
                   "webview_share_button" : "hide"
                 }
               ]
             }])
            res.setHeader("Content-type", "application/json");
            res.send(JSON.stringify(output));
        });
    });

    app.get('/cron/reminders', function (req, res){
        agent.getFutureBookings(function(error, bookings){
            if(error){
                console.log(error);
            } else {
                for(var i=0; i<bookings.length;i++){
                    var booking = bookings[i];
                    agent.getCourtById(booking.court_id, function(error, court){
                        if(error || !court){
                            console.log(error);
                        } else {
                            var message = "Your tennis booking at " + court.name;
                                message += " at " + booking.bookingDate.toTimeString.substr(0,5);
                                message += " is coming up in two days time!";
                            notify.notifyUser(booking.sender_id, message, function(err, resp){
                                if(err){
                                    console.log(err);
                                } else {
                                    console.log(resp);
                                }
                            });
                        }
                    })
                }
            }
        });
        res.sendStatus(200);
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
