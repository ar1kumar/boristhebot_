'use strict';

var http = require('http');
var https = require('https');

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

var Agent = require("./lib/agent.js");
var	agent = new Agent();

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
const helpModule = require('./lib/helpfaq.js');


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
bot.module(helpModule);
//Start the bot
bot.start(config.bot_port);

bot.setGreetingText('Welcome!');
bot.setGetStartedButton((payload, chat) => {
  console.log('starting');
  chat.say({
    text: 'What are you looking for?',
    quickReplies: ['New Booking', 'Check Status']
  });
});

//Bot actions and postbacks
bot.hear('New Booking', (payload, chat)=>{
  const askName = (convo) => {
		convo.ask(`What's your name?`, (payload, convo) => {
			const text = payload.message.text;
			convo.set('name', text);
			convo.say(`Oh, your name is ${text}`).then(() => askFavoriteFood(convo));
		});
	};

	const askFavoriteFood = (convo) => {
		convo.ask(`What's your favorite food?`, (payload, convo) => {
			const text = payload.message.text;
			convo.set('food', text);
			convo.say(`Got it, your favorite food is ${text}`).then(() => sendSummary(convo));
		});
	};

	const sendSummary = (convo) => {
		convo.say(`Ok, here's what you told me about you:
	      - Name: ${convo.get('name')}
	      - Favorite Food: ${convo.get('food')}`);
      convo.end();
	};

  chat.conversation((convo) => {
		askName(convo);
	});
})
