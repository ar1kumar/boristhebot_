module.exports = {
  //script : {
    welcome : "",
    greetings : {
      initial : "",
      positive : ["yes please", "yes", "yeah", "yup"],
      negative : ["not today, thanks", "no"]
    },
    convo : {
      date : {
        ask : "Great, when would you like to play? Please enter a date.(ex:- 'June 1 or 01/06')",
        invalid : "Oops, looks like you have entered an invalid date.",
        askAgain: "Can you try again? Please enter a valid date.",
        success : "Date confirmed",
        validated : "Thank you. You have selected"
      },
      time : {
        ask : {
          text : "Ok, what time would you like to play?",
          quickReplies : ['Before 9am', 'Around lunchtime', 'After work']
        },
        success : "Thanks, time confirmed",
        error : "Sorry, I don't understand."
      },
      location : {
        ask : {
          text : "Tell me the postcode where you’d like to play and I’ll find the nearest available court(or you can send me your current location)",
          quickReplies : [{
            "content_type":"location",
          }]
        },
        //ask : "Share your current location with me and I’ll find the nearest available court",
        invalid : "Oops, looks like you have entered an invalid loction. Please try again"
      }
    },
    generic : {
      negative : "Understandable, have a nice day."
    }
}
