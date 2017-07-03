module.exports = function(bot){
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
