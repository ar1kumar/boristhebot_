//Adding config
var config = require('../config/index.js');

//Adding messenger module
const BootBot = require('bootbot');

//Bot credentials
const bot = new BootBot(config.fb_tokens);

module.exports = {
  notifyUser : function(userId, message, callback){
    if(userId){
      bot.sendTextMessage(userId, message, [
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
      callback("done");
    }
  }
}
