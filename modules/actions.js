'use strict';

var Utils = require('./../utils/utils.js');

module.exports = (bot) => {
  //Bot actions and postbacks
  bot.hear('Yes please', (payload, chat)=>{
    chat.conversation((convo) => {
  		askDate(convo);
  	});
  });

  bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat)=>{
    chat.say({
      text : 'Hello! Would you like to make a booking now?',
      quickReplies : ['Yes please', 'Not today, thanks']
    })
  });

  bot.hear('Not today, thanks', (payload, chat)=>{
    chat.say('Understandable, have a nice day.');
  })

  //Main bot conversation
  const askDate = (convo) => {
    convo.ask(`Great, when would you like to play? Please enter a date.(ex:- "June 1 or 01/06")`, (payload, convo) => {
      Utils.sanitizeDate(payload.message.text, function(err, resp){
        if(err){
          convo.say('Oops, looks like you have entered an invalid date.').then(()=>dateError(convo));
        }else{
          convo.set('date', resp);
          //convo.say(`Date confirmed`).then(() => askAdditionalDate(convo));
          convo.say(`Date confirmed`).then(() => askTime(convo));
        }
      });
    });
  };

  const dateError = (convo) =>{
    convo.ask('Can you try again? Please enter a valid date.', (payload, convo)=>{
      Utils.sanitizeDate(payload.message.text, function(err, resp){
        if(err){
          convo.say('Oops, looks like you have entered an invalid date.').then(()=>dateError(convo));
        }else{
          convo.set('date', resp);
          convo.say(`Date confirmed`).then(() => askAdditionalDate(convo));
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
    var time = {
      text : 'Ok, what time would you like to play?',
      quickReplies : ['Before 9am', 'Around lunchtime', 'After work']
    }
    convo.ask(time, (payload, convo) => {
      convo.set('time', payload.message.text);
      convo.say(`Thanks, time confirmed`).then(() => askLocation(convo));
    });
  }

  const askLocation = (convo) =>{
    convo.ask("Tell me the postcode where you’d like to play and I’ll find the nearest available court(or you can send me your current location)", (payload, convo)=>{
      console.log('Location payload', payload.message.attachments.payload.coordinates);
      convo.set('location', 'Playtime for adults');
      convo.say('Thanks').then(()=> sendSummary(convo));
    })
  };

  const sendSummary = (convo) => {
    convo.say(`Ok, here's a quick summary:
        - Date: ${convo.get('date')}
        - Time: ${convo.get('time')}
        - Location: ${convo.get('location')}`
      );
      convo.end();
  };

};
