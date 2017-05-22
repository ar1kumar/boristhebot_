var hooman = {

}

var boris = {
  "get started" : {
    text : "When do you wanna play?"
  }
}


var play = {
  respond : function(input, callback){
    if(boris[this.sanitize(input)]){

    }else{

    }
  },
  sanitize : function(input){
    // #TODO - Need to add more sanitizing options later
    if(input){
      return input.toLowerCase();
    }else{
      return "Sorry, I don't understand."
    }
  }
};

module.exports = {
  play : play
}

// Sample card response
// chat.say({
// 		text: 'What do you need help with?',
// 		buttons: [
// 			{ type: 'postback', title: 'Settings', payload: 'HELP_SETTINGS' },
// 			{ type: 'postback', title: 'FAQ', payload: 'HELP_FAQ' },
// 			{ type: 'postback', title: 'Talk to a human', payload: 'HELP_HUMAN' }
// 		]
// 	});
