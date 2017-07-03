//Adding config
var config = require('../config/index.js');

//Adding messenger module
const BootBot = require('bootbot');

//Bot credentials
const bot = new BootBot(config.fb_tokens);

module.exports = {
  this.notifyUser = function(userId, callback){
    if(userId){
    bot.sendTextMessage(userId, "Hi! This is a gentle reminder about your upcoming booking", [
      {
        "content_type":"text",
        "title":"Okay",
        "payload":"notify-ack"
      },
      {
        "content_type":"text",
        "title":"Know more",
        "payload": "notify-more"
      }
    ]);
    }
    console.log("bot object",bot)
    callback("done");
  }
}
