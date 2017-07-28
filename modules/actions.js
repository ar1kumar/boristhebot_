'use strict';

var Utils = require('./../utils/utils.js');
var script = require('./script.js');
var Agent = require('./../lib/agent.js');
var	agent = new Agent();
var async = require('async');

const disableInput = false;
var initiated = false; //Set this to true when the first initiation happens with the bot

var notify = require('./notification.js');
var generic = true;

module.exports = (bot) => {

  //Bot actions and postbacks
  bot.on('message', (payload, chat)=>{
   var text = payload.message.text;
   if(script.greetings.positive.indexOf(text.toLowerCase()) > -1){
     initiated = true;
     generic = false;
     chat.conversation((convo) => {
       askDate(convo);
     });
   }
   if(script.greetings.negative.indexOf(text.toLowerCase()) > -1){
     initiated = true;
     generic = false;
     chat.say(script.generic.negative);
   }
   //listen for any generic messages
   if(script.greetings.training.indexOf(text.toLowerCase()) > -1){
     generic = false;
     chat.conversation((convo) => {
       begForUpsell(convo);
     });
   }
   if(generic){
     chat.say("Hi, you can use the quick access menu to manage or make a new booking.");
   }

   if(payload.message.quick_reply){
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
      if(typeof payload.postback.payload != "undefined" && payload.postback.payload){
        var message = payload.postback.payload;
        convo.set('date', message.split('#')[0]);
        convo.set('time', message.split('#')[1]);
        askTime(convo);
      }
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
      if(typeof(payload.message.quick_reply) != "undefined"){
        if(script.convo.time.ask.timeVals.indexOf(payload.message.quick_reply.payload) > -1){
          convo.set('time', payload.message.quick_reply.payload);
          convo.say(script.convo.time.success).then(() => askLocation(convo));
        }else{
          convo.say(script.convo.time.error).then(() => askTime(convo));
        }
      }
    });
  }

  const askLocation = (convo) =>{
    convo.ask(script.convo.location.ask, (payload, convo)=>{
      console.log('Location payload', payload.message);
      if(payload.message.attachments && typeof payload.message.attachments != "undefined"){
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
            console.log('time selected', convo.get('time'));
            console.log('court selected', text);
            agent.checkCourtTimes(convo.get('date'), convo.get('time'), convo.get('court').split('#')[1], function(err, res){
              if(err){
                console.log('check court time err',err);
                convo.say('Oops the selected court is not available at this moment, please select a different court. Sorry!').then(()=>askLocation(convo));
              }else if(res.length > 0){
                console.log('check court time response',res);
                showAvailableTimes(convo, courts, res);
              }else{
                convo.say('Oops the selected court is not available at this moment, please select a different court. Sorry!').then(()=>askLocation(convo));
              }
            });
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
        convo.say(`Thanks for selecting, here's a quick summary`).then(() => sendSummary(convo, courts));
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
                   "url":"https://sportingbot.forever-beta.com/webview/booking.html",
                   "title":"Edit info",
                   "webview_height_ratio": "compact",
                   "messenger_extensions": true,
                   "fallback_url" : "https://sportingbot.forever-beta.com/webview/booking_fallback.html?uid="+convo.userId,
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
              convo.end();
            }else{
              convo.say("Working on it, check back soon.");
              convo.end();
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
      if(payload.message.quick_reply.payload === "remind-yes"){
        agent.setReminder(convo.userId, function(err){
          console.log('Set reminder resp', err);
          if(!err){
            var confirmText = "Great news, I'll let you know. Enjoy your day.";
            confirmReminder(convo, confirmText);
          }
        })
      }else{
        var confirmText = "No worries. Enjoy your day.";
        confirmReminder(convo, confirmText);
      }
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
          if(text === "book_training"){
            begForUpsell(convo);
          }else{
            convo.say("This service isn't available, but you can use the quick access menu at any time to make a new booking.");
            convo.end();
          }
        }
      }
    ])
  }

  const begForUpsell = (convo) => {
    convo.ask({
      text : "Thanks for using The British Tennis Bot! Hopefully you’re finding it easy to use and hassle-free. Did you know we also offer some other things you might be interested in?",
      quickReplies : script.convo.upsell.quickReplies
      }, (payload, convo) => {
        if(typeof(payload.message.quick_reply.payload) != "undefined"){
          var text = payload.message.quick_reply.payload;
          if(payload.message.quick_reply.payload === "upsell-mp"){
            convo.say("British Tennis run weekly training sessions. Advantage 6 is for players looking to improve their overall skill levels and beat their mates. Tennis Tuesdays is for players looking to play competitive tennis but also make friends and socialise afterwards.");
          }
          if(payload.message.quick_reply.payload === "upsell-fit"){
            convo.say("If you want to run around the court faster for longer and improve your overall fitness, then cardio tennis is for you.");
          }
          if(payload.message.quick_reply.payload === "upsell-league"){
            convo.say("If you’re looking to play friendly yet competitive tennis then the Local Tennis Leagues website will find a court near you.");
          }
          if(payload.message.quick_reply.payload === "upsell-club"){
            convo.say("This service isn't available, but you can use the quick access menu at any time to make a new booking.");
          }
          convo.end();
          //Start new booking if user selects "book a court" option
          if(payload.message.quick_reply.payload === "upsell-court"){
            askDate(convo);
          }
        }
    })
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
          payload: 'book_now_main'
        },
        {
          title: 'Check status',
          type: 'postback',
          payload: 'status'
        },
        {
          title: 'Book a training',
          type: 'postback',
          payload: 'book_training_menu'
        }
      ]
    }
  ], disableInput);

  bot.on('postback:book_now_main', (payload, chat) => {
    console.log('persistent menu clicked - book now');
    chat.conversation((convo) => {
      askDate(convo);
    });
  });

  bot.on('postback:book_training_menu', (payload, chat) => {
    console.log('persistent menu clicked - book training');
    chat.conversation((convo) => {
      begForUpsell(convo);
    });
  });

  bot.on('postback:status', (payload, chat) => {
    chat.say(`Check your booking status and edit info. WIP.`);
  });

  bot.on('postback:know_more', (payload, chat) => {
    chat.say(`no`);
  });

  bot.on('postback:buy_now', (payload, chat) => {
    chat.say("Thanks for the payment (this functionality isn’t yet activated)");
  });
};
