'use strict';

var Utils = require('./../utils/utils.js');
var script = require('./script.js');
var Agent = require('./../lib/agent.js');
var	agent = new Agent();
var async = require('async');

const disableInput = false;
var initiated = false; //Set this to true when the first initiation happens with the bot

module.exports = (bot) => {
  //Bot actions and postbacks
  bot.on('message', (payload, chat)=>{
   var text = payload.message.text;
   if(script.greetings.positive.indexOf(text.toLowerCase()) > -1){
     initiated = true;
     chat.conversation((convo) => {
       askDate(convo);
     });
   }
   if(script.greetings.negative.indexOf(text.toLowerCase()) > -1){
     initiated = true;
     chat.say(script.generic.negative);
   }
   //listen for any generic messages
  });

  //Main bot conversation
  const askDate = (convo) => {
    // convo.ask(script.convo.date.ask, (payload, convo) => {
    //   Utils.sanitizeDate(payload.message.text, function(err, resp){
    //     if(err){
    //       convo.say(script.convo.date.invalid).then(()=>dateError(convo));
    //     }else{
    //       convo.set('date', resp);
    //       //convo.say(`Date confirmed`).then(() => askAdditionalDate(convo));
    //       convo.say(script.convo.date.success).then(() => askTime(convo));
    //     }
    //   });
    // });
    convo.ask((convo)=>{
      convo.sendGenericTemplate([{
         "title": "Please select a date",
         //"image_url": courtSelected.images[0],
         "subtitle":"",
         "buttons":[{
           "type":"web_url",
           "url":"https://sportingbot.forever-beta.com/webview/date.html",
           "title":"Select Date",
           "webview_height_ratio": "compact",
           "webview_share_button" : "hide"
          }]
       }])
    }, (payload, convo) => {
      // Utils.sanitizeDate(payload.message.text, function(err, resp){
      //   if(err){
      //     convo.say(script.convo.date.invalid).then(()=>dateError(convo));
      //   }else{
      //     convo.set('date', resp);
      //     //convo.say(`Date confirmed`).then(() => askAdditionalDate(convo));
      //     convo.say(script.convo.date.success).then(() => askTime(convo));
      //   }
      // });
    });
  };

  const dateError = (convo) =>{
    convo.ask(script.convo.date.askAgain, (payload, convo)=>{
      Utils.sanitizeDate(payload.message.text, function(err, resp){
        if(err){
          convo.say(script.convo.date.invalid).then(()=>dateError(convo));
        }else{
          convo.set('date', resp);
          convo.say(script.convo.date.success).then(() => askTime(convo));
        }
      });
    })
  }

  const dateNotAvailable = (convo) =>{
    convo.ask('Try an other date', (payload, convo)=>{

    })
  }

  const askAdditionalDate = (convo) => {
    convo.ask(`Would you like to add another?`, (payload, convo) => {
      Utils.sanitizeDate(payload.message.text, function(err, resp){
        if(err){
          convo.say('Oops, looks like you have entered an invalid date.').then(()=>dateError(convo));
        }else{
          exCount++;
          convo.set('dateEx'+exCount, resp);
          convo.say(`Date confirmed`).then(() => askTime(convo));
        }
      });
    });
  };

  const askTime = (convo) => {
    convo.ask(script.convo.time.ask, (payload, convo) => {
      if(script.convo.time.ask.quickReplies.indexOf(payload.message.text) > -1){
        convo.set('time', payload.message.text);
        convo.say(script.convo.time.success).then(() => askLocation(convo));
      }else{
        convo.say(script.convo.time.error).then(() => askTime(convo));
      }
    });
  }

  const askLocation = (convo) =>{
    convo.ask(script.convo.location.ask, (payload, convo)=>{
      //console.log('Location payload', payload.message.attachments[0].payload.coordinates);
      if(payload.message.attachments && payload.message.attachments != []){
        if(payload.message.attachments[0].payload.coordinates){
            var location = payload.message.attachments[0].payload.coordinates;
            agent.getNearestCourtFromLocation(payload.sender.id, location, null, function(err, resp){
              //console.log('location response from db', resp);
              if(err) convo.say(script.convo.location.invalid).then(()=> askLocation(convo));
              else convo.say('Thanks').then(()=> displayCourts(convo, resp));
            })
        }
      }else{
        var location = payload.message.text;
        agent.getNearestCourtFromPostcode(payload.sender.id, location, null, function(err, resp){
          //console.log('location response from db', resp);
          if(err) convo.say(script.convo.location.invalid).then(()=> askLocation(convo));
          else convo.say('Thanks').then(()=> displayCourts(convo, resp));
        })
      }
    })
  };

  const displayCourts = (convo, courts) => {
    convo.ask((convo)=>{
      async.series([
          function(callback) {
              Utils.prepareCourtsJson(courts, callback)
          },
          function(callback) {
              callback(null, []);
          }
      ],
      function(err, results) {
          // results is now equal to ['one', 'two']
          convo.sendGenericTemplate(results[0]);
      });
    }, (payload, convo, data) => {
      // console.log('button payload', payoad);
      // const text = payload.message.text;
      // convo.set('court', text);
      // convo.say(`Great, here's a quick summary`).then(() => sendSummary(convo))
    }, [
        {
          event: 'postback',
          callback: (payload, convo) => {
            console.log('button payload', payload);
            const text = payload.postback.payload;
            convo.set('court', text);
            convo.say(`Great, here's a quick summary`).then(() => sendSummary(convo, courts))
          }
        }
      ])
  };

  const sendSummary = (convo, courtslist) => {
    // - Date: convo.get('date')
    // - Time: convo.get('time')
    // - Location: convo.get('court')
      convo.ask((convo)=>{
        var courtSelected = courtslist[convo.get('court')];
        convo.sendGenericTemplate([{
           "title": courtSelected.name,
           "image_url": courtSelected.images[0],
           "subtitle":"Date: "+convo.get('date')+", Time: "+convo.get('time'),
           "buttons":[
             {
               "type":"postback",
               "title":"Make Payment",
               "payload":"buy_now"
             },
             {
               "type":"postback",
               "title":"Edit info",
               "payload":"edit"
             }
           ]
         }])
      }, (payload, convo, data)=>{

      }, [
        {
          event: 'postback',
          callback: (payload, convo) => {
            console.log('button payload', payload);
            const text = payload.postback.payload;
            convo.say("Sorry I am still learning, my masters haven't taught me how to perform this task yet.");
            convo.end();
            //convo.say(`Great, here's a quick summary`).then(() => editInfo(convo))
          }
        }
      ])
      //convo.end();
  };

  //set persistent menu -
  bot.setPersistentMenu([
    {
      title: 'Quick Access',
      type: 'nested',
      call_to_actions: [
        {
          title: 'Book now',
          type: 'postback',
          payload: 'book_now'
        },
        {
          title: 'Check status',
          type: 'postback',
          payload: 'status'
        },
        {
          title: 'Know more',
          type: 'postback',
          payload: 'know_more'
        }
      ]
    }
  ], disableInput);

  bot.on('postback:book_now', (payload, chat) => {
    chat.conversation((convo) => {
      askDate(convo);
    });
  });

  bot.on('postback:status', (payload, chat) => {
    chat.say(`I can't do that and NO you can't speak to the manager`);
  });

  bot.on('postback:know_more', (payload, chat) => {
    chat.say(`no`);
  });

};
