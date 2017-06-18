'use strict';

var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var Agent = require("./lib/agent.js");
var	agent = new Agent();

var Utils = require('./utils/utils.js')

// var app = express();
//
// // Application middleware
// app.use(bodyParser.json());
//
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });


//Adding config
var config = require('./config/index.js');

//Adding messenger module
const BootBot = require('bootbot');

//Bot credentials
const bot = new BootBot(config.fb_tokens);
const helpModule = require('./lib/helpfaq.js');
const actionsModule = require('./modules/actions.js');

// Adding route for facebook verification
//var server = http.createServer(app);
//var httpsServer = https.createServer(config.https_options, app);

//since this can run as a separate service, starting http and https as separate services is optional
// server.listen(config.port, function(){
//     console.log('Boris http Server Started On ' + config.port);
// });
//Httpserver
// httpsServer.listen(config.https_port, function(){
//     console.log('Boris https Server Started On ' + config.https_port);
// }).on('error',function(err){
//   console.log(err);
// });

//Start the bot
bot.start(config.bot_port);

bot.setGreetingText('Welcome! There’s now a simple and hassle-free way to book a tennis court.');

var uid;
bot.setGetStartedButton((payload, chat) => {
  console.log('incoming', payload);
  var uid = payload.sender.id;
  chat.getUserProfile().then((user) => {
    console.log('user info', user); //Save the user info and initiate the session
  });
  if(payload.postback.referral.ref){
    chat.say({
    	text: 'Your friend has invited you play tennis. Wanna join?',
    	quickReplies: [
        {
          "content_type":"text",
          "title":"No, maybe later",
          "payload": "invite:no:"+payload.sender.id
        },
        {
          "content_type":"text",
          "title":"Yeah",
          "payload": "invite:yes:"+payload.sender.id+":"+payload.postback.referral.ref
        }
      ]
    });
  }else{
    chat.say({
      text: `Hello ${user.first_name}! Want to book a court today?`,
      quickReplies: ['Not today, thanks', 'Yes please']
    });
  }
});

//bot module for actions and conversation
bot.module(actionsModule);

//Added routes
require('./routes')(bot.app, bot);
