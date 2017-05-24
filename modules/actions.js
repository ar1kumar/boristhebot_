'use strict';

var Utils = require('./../utils/utils.js');
const disableInput = true

module.exports = (bot) => {
  //Bot actions and postbacks
  bot.hear(['Yes please', 'yes', 'ya', 'yup'], (payload, chat)=>{
    chat.conversation((convo) => {
  		askDate(convo);
  	});
  });

  // bot.on('message', (payload, chat)=>{
  //
  // });

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
    convo.ask(time, disableInput, (payload, convo) => {
      convo.set('time', payload.message.text);
      convo.say(`Thanks, time confirmed`).then(() => askLocation(convo));
    });
  }

  const askLocation = (convo) =>{
    convo.ask("Tell me the postcode where you’d like to play and I’ll find the nearest available court(or you can send me your current location)", (payload, convo)=>{
      console.log('Location payload', payload.message.attachments[0].payload.coordinates);
      if(payload.message.attachments[0].payload.coordinates){
        convo.set('location', payload.message.attachments[0].payload.coordinates);
        convo.say('Thanks').then(()=> sendSummary(convo));
      }else{
        convo.say('Oops, looks like you have entered an invalid loction. Please try again').then(()=> askLocation(convo));
      }
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
