module.exports = {
  //script : {
    welcome : "",
    greetings : {
      initial : "",
      positive : ["yes please", "yes", "yup", "book a court"],
      training : ["book a training"],
      negative : ["not today, thanks", "no"],
      generic : ["manage a booking"]
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
          timeVals : ['BF', 'LUN', 'AF'],
          quickReplies : [
            {
              "content_type":"text",
              "title":"Before 9am",
              "payload": "BF"
            },
            {
              "content_type" : "text",
              "title" : "Around lunchtime",
              "payload" : "LUN"
            },
            {
              "content_type" : "text",
              "title" : "After work",
              "payload" : "AF"
            }
          ]
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
      },
      reminder : {
        quickReplies : [
          {
            "content_type" : "text",
            "title" : "No thank you",
            "payload" : "remind-no"
          },
          {
            "content_type" : "text",
            "title" : "Okay",
            "payload" : "remind-yes"
          }
        ]
      },
      upsell : {
        quickReplies : [
          {
            "content_type" : "text",
            "title" : "Improve my matchplay",
            "payload" : "upsell-mp"
          },
          {
            "content_type" : "text",
            "title" : "Improve my fitness",
            "payload" : "upsell-fit"
          },
          {
            "content_type" : "text",
            "title" : "Find a league",
            "payload" : "upsell-league"
          },
          {
            "content_type" : "text",
            "title" : "Find a club",
            "payload" : "upsell-club"
          },
          {
            "content_type" : "text",
            "title" : "Book a court",
            "payload" : "upsell-court"
          }
        ]
      }
    },
    generic : {
      negative : "Understandable, have a nice day."
    }
}
