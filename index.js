
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

//Adding messenger module
const BootBot = require('bootbot');

//Adding config
var config = require('config/index.js');

// const bot = new BootBot({
//   accessToken: 'FB_ACCESS_TOKEN',
//   verifyToken: 'FB_VERIFY_TOKEN',
//   appSecret: 'FB_APP_SECRET'
// });
//
// bot.on('message', (payload, chat) => {
//   const text = payload.message.text;
//   chat.say(`Echo: ${text}`);
// });
//
// bot.start();

// Adding route for facebook verification
var server = http.createServer(app);
var httpsServer = https.createServer(config.https_options, app);
server.listen(config.port, function(){
    console.log('Boris http Server Started On ' + config.port);
});
//Httpserver
// httpsServer.listen(config.https_port, function(){
//     console.log('Boris https Server Started On ' + config.https_port);
// }).on('error',function(err){
//   console.log(err);
// });
