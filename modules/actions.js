'use strict';

var Utils = require('./../utils/utils.js');
var script = require('./script.js');
var Agent = require('./../lib/agent.js');
var	agent = new Agent();

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
    convo.ask(script.convo.date.ask, (payload, convo) => {
      Utils.sanitizeDate(payload.message.text, function(err, resp){
        if(err){
          convo.say(script.convo.date.invalid).then(()=>dateError(convo));
        }else{
          convo.set('date', resp);
          //convo.say(`Date confirmed`).then(() => askAdditionalDate(convo));
          convo.say(script.convo.date.success).then(() => askTime(convo));
        }
      });
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
              console.log('location response from db', resp);
              if(err) convo.say(script.convo.location.invalid).then(()=> askLocation(convo));
              else convo.say('Thanks').then(()=> displayCourts(convo, null));
            })
        }
      }else{
        var location = payload.message.text;
        agent.getNearestCourtFromPostcode(payload.sender.id, location, null, function(err, resp){
          console.log('location response from db', resp);
          if(err) convo.say(script.convo.location.invalid).then(()=> askLocation(convo));
          else convo.say('Thanks').then(()=> displayCourts(convo, null));
        })
      }
    })
  };

  const displayCourts = (convo, courts) => {
    var courts = [{
       "title":"Lincoln's Inn Fields",
       "image_url":"http://townofreddingct.org/app/uploads/2015/02/Tennis-Court-stock-800.jpg",
       "subtitle":"5 Pancras Square, Holborn, London, WC2A 3TL",
       "buttons":[
         {
           "type":"postback",
           "title":"Book Now",
           "payload":"Lincoln's Inn Fields"
         }
       ]
     },
     {
       "title":"Westway Sports Centre",
       "image_url":"http://www.bridgepointroadmarkings.com/wp-content/uploads/2012/07/tennis-court.jpg",
       "subtitle":"1 Crowthorne Road, London, W10 6RP",
       "buttons":[
         {
           "type":"postback",
           "title":"Book Now",
           "payload":"Westway Sports Centre"
         }
       ]
     }
    ];
    convo.ask((convo)=>{
      convo.sendGenericTemplate(courts);
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
            convo.say(`Great, here's a quick summary`).then(() => sendSummary(convo))
          }
        }
      ])
  };

  const sendSummary = (convo) => {
    // - Date: convo.get('date')
    // - Time: convo.get('time')
    // - Location: convo.get('court')
      convo.ask((convo)=>{
        convo.sendGenericTemplate([{
           "title": convo.get('court'),
           "image_url":"http://townofreddingct.org/app/uploads/2015/02/Tennis-Court-stock-800.jpg",
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
