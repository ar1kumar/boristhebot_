'use strict';

var Utils = require('./../utils/utils.js');
var script = require('./script.js');
var Agent = require('./../lib/agent.js');
var	agent = new Agent();
var async = require('async');

const disableInput = false;
var initiated = false; //Set this to true when the first initiation happens with the bot

var notify = require('./notification.js');

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
   if(script.greetings.generic.indexOf(text.toLowerCase()) > -1){
     chat.say("This service isn't available, but you can use the quick access menu at any time to make a new booking.");
   }
  });

  //bot referral events
  bot.on('referral', (payload, chat)=>{
    console.log('referral payload', payload);
    var sender_id = payload.referral.ref.split(":")[1];
    var booking_id = payload.referral.ref.split(":")[0];
    agent.getBookingDetailsByID (booking_id, function(err, booking, court){
      if(!err){
        chat.say({
          text: 'Your friend would like to play tennis with you on the '+booking.bookingDate+' at '+court.name+', '+court.address,
          quickReplies: [
            {
              "content_type":"text",
              "title":"No, maybe later",
              "payload": "invite:no:"+sender_id
            },
            {
              "content_type":"text",
              "title":"Yeah",
              "payload": "invite:Yeah:"+sender_id+":"+booking_id
            }
          ]
        });
      }else{
        console.log('get booking details error', err);
      }
    })
  })

  bot.on("message", (payload, chat)=>{
    console.log('invite message', payload);
    var text = payload.message.quick_reply.payload;
    if(text.split(':')[1] == "Yeah"){
      console.log('invite accepted');
      chat.say('Sweet, we will tell your friend.')
      agent.inviteToBooking(text.split(':')[2], text.split(':')[3], function(err, sender_id){
        if(!err){
          console.log("invite db resp", sender_id);
          bot.sendTextMessage(text.split(':')[2], "Hi! Your friend has accepted your invitation.");
        }else{
          console.log('invite db error', err)
        }
      })
    }
    if(text.split(':')[1] == "no"){
      console.log('invite rejected');
      chat.say('No problem, maybe later.');
    }
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
      console.log("conversation object", convo.userId);
      convo.sendGenericTemplate([{
         "title": "Please select a date",
         //"image_url": courtSelected.images[0],
         "subtitle":"",
         "buttons":[{
           "type":"web_url",
           "url":"https://sportingbot.forever-beta.com/webview/date.html",
           "title":"Select date",
           "webview_height_ratio": "compact",
           "messenger_extensions": true,
           "fallback_url" : "https://sportingbot.forever-beta.com/webview/date_fallback.html?uid="+convo.userId,
           "webview_share_button" : "hide"
          }]
       }]);
    }, (payload, convo) => {
      console.log('conversation payload', payload);
      var message = payload.postback.payload;
      convo.set('date', message.split('#')[0]);
      convo.set('time', message.split('#')[1]);
      askTime(convo);
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

  const editDate = (convo) =>{
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
      if(script.convo.time.ask.timeVals.indexOf(payload.message.quick_reply.payload) > -1){
        convo.set('time', payload.message.quick_reply.payload);
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
            console.log('location lat & lng', location);
            agent.getNearestCourtFromLocation(payload.sender.id, location, null, function(err, resp){
              //console.log('location response from db', resp);
              if(err) convo.say(script.convo.location.invalid).then(()=> askLocation(convo));
              else convo.say("Thanks, here's what I found").then(()=> displayCourts(convo, resp));
            })
        }
      }else{
        var location = payload.message.text;
        agent.getNearestCourtFromPostcode(payload.sender.id, location, null, function(err, resp){
          //console.log('location response from db', resp);
          if(err) convo.say(script.convo.location.invalid).then(()=> askLocation(convo));
          else convo.say("Thanks, here's what I found").then(()=> displayCourts(convo, resp));
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
            console.log('date selected', convo.get('date'));
            agent.checkCourtTimes(convo.get('date'), convo.get('time'), convo.set('court', text), function(err, res){
              if(err) console.log('check court time err',err)
              else console.log('check court time response',res);
              //convo.say(`Great, here's a quick summary`).then(() => sendSummary(convo, courts))
              showAvailableTimes(convo, courts, res);
            });
            //convo.say('The following times are available at the selected court')
          }
        }
      ])
  };

  const showAvailableTimes = (convo, courts, times) =>{
    console.log('show the list of available times');
    Utils.prepareTimeArray(times, function(err, timeQuickReply){
      if(!err)
      convo.ask({
        text : "The following times are available",
        quickReplies : timeQuickReply
        }, (payload, convo) => {
        console.log('time selected', payload);
        convo.set('time', payload.message.quick_reply.payload);
        convo.say(`Thanks for selecting, here's a quick summary`);
        //.then(() => sendSummary(convo, courts));
        sendSummary(convo, courts);
      })
    });
  }

  const sendSummary = (convo, courtslist) => {
      convo.ask((convo)=>{
        var courtSelected = courtslist[convo.get('court').split("#")[0]];
        console.log('court details', courtSelected);
        //save data to db
        agent.bookCourt(convo.userId, courtSelected._id, convo.get('date')+' '+convo.get('time'), function(error, booking){
          if(!error){
            console.log('booking details from db', booking);
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
                   "type":"web_url",
                   "url":"https://sportingbot.forever-beta.com/webview/time.html?date="+convo.get('date')+"&court_id="+courtSelected._id,
                   "title":"Invite friends",
                   "webview_height_ratio": "compact",
                   "messenger_extensions": true,
                   "fallback_url" : "https://sportingbot.forever-beta.com/webview/time_fallback.html?date="+convo.get('date')+"&court_id="+courtSelected._id,
                   "webview_share_button" : "hide"
                 },
                 {
                   "type":"web_url",
                   "url":"https://sportingbot.forever-beta.com/webview/invite.html?booking_id="+booking._id+"&user_id="+convo.userId,
                   "title":"Invite friends",
                   "webview_height_ratio": "compact",
                   "messenger_extensions": true,
                   "fallback_url" : "https://sportingbot.forever-beta.com/webview/invite_fallback.html?booking_id="+booking._id+"&user_id="+convo.userId,
                   "webview_share_button" : "hide"
                 }
               ]
             }])
          }else{
            console.log('db save error', error);
          }
        })
      }, (payload, convo, data)=>{

      }, [
        {
          event: 'postback',
          callback: (payload, convo) => {
            console.log('button payload', payload);
            const text = payload.postback.payload;
            if(text == "buy_now"){
              convo.say("Thanks for the payment (this functionality isn’t yet activated)").then(()=> addReminder(convo));
            }else if(text == "booking_cancel"){
              convo.say("If you want to book again you can use the quick access menu to start a new booking process. Thank you.");
            }else{
              convo.say("Working on it, check back soon.");
            }
            //convo.end();
            //convo.say(`Great, here's a quick summary`).then(() => editInfo(convo))
          }
        }
      ])
      //convo.end();
  };

  const addReminder = (convo) =>{
    convo.ask({
      text : "I'll remind you 2 days before playing if that's okay with you.",
      quickReplies : script.convo.reminder.quickReplies
      }, (payload, convo) => {
      convo.set('reminder', payload.message.quick_reply.payload);
      if(payload.message.quick_reply.payload === "remind-yes")
        var confirmText = "Great news, I'll let you know. Enjoy your day.";
      else
        var confirmText = "No worries. Enjoy your day.";
        confirmReminder(convo, confirmText);
    })
  }

  const confirmReminder = (convo, confirmText) => {
    convo.ask((convo)=>{
      convo.sendGenericTemplate([{
         "title": confirmText,
         "subtitle": "",
         "buttons":[
           {
             "type":"postback",
             "title":"Manage booking",
             "payload":"edit_booking"
           },
           {
             "type":"postback",
             "title":"Book a training",
             "payload":"book_training"
           }
         ]
       }])
    }, (payload, convo, data)=> {

    }, [
      {
        event : "postback",
        callback : (payload, convo)=>{
          const text = payload.postback.payload;
          convo.say("This service isn't available, but you can use the quick access menu at any time to make a new booking.")
        }
      }
    ])
  }

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
    chat.say(`Check your booking status and edit info. WIP.`);
  });

  bot.on('postback:know_more', (payload, chat) => {
    chat.say(`no`);
  });

};
