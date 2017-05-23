'use strict';

var Utils = require('./../utils/utils.js');

module.exports = (bot) => {
  //Bot actions and postbacks
  bot.hear('Yes please', (payload, chat)=>{
    const askDate = (convo) => {
  		convo.ask(`Great, when would you like to play? Please enter a date.`, (payload, convo) => {
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
      convo.ask(`Ok, what time would you like to play?`, (payload, convo) => {
        convo.set('time', payload.message.text);
        convo.say(`Date confirmed`).then(() => sendSummary(convo));
  		});
    }

  	const sendSummary = (convo) => {
  		convo.say(`Ok, here's a quick summary:
  	      - Date: ${convo.get('date')}
  	      - Time: ${convo.get('time')}`);
        convo.end();
  	};

    chat.conversation((convo) => {
  		askDate(convo);
  	});
  })
};
