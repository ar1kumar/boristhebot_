
'use strict';
var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();

// Application middleware
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

require('./routes')(app);

//Adding config
var config = require('./config/index.js');

//Adding messenger module
const BootBot = require('bootbot');

//Bot credentials
const bot = new BootBot(config.fb_tokens);


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

bot.setGreetingText('How can I help you?');
bot.setGetStartedButton((payload, chat) => {
  chat.say('Get Started!');
});

//Bot actions and postbacks
bot.on('message', (payload, chat) => {
  const text = payload.message.text;
  chat.say(`Echo: ${text}`);
});
