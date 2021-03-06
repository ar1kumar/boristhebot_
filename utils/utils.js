//import date exraction module
var chrono = require('chrono-node');
var async = require('async');

var sanitizeDate = function(input, callback){
  if(input){
    //var checkDate = chrono.parse(input);
    if(Object.prototype.toString.call(chrono.parse(input)[0].start.date()) === '[object Date]'){
      console.log("date object validity",chrono.parse(input));
      callback(null, chrono.parse(input)[0].start.date());
    }else{
      callback('invalid_date', null);
    }
  }
}

var prepareCourtsJson = function(input, sendResponse){
  var courtsModel = [];
  async.each(input, function(item, callback) {
    //console.log('court data',item);
    courtsModel.push({
      "title": item.name,
      "image_url": item.images[0],
      "subtitle": item.address,
      "buttons":[
        {
          "type":"postback",
          "title":"Book Now",
          "payload": courtsModel.length+"#"+item._id
        }
      ]
    });
    callback();
   }, function(err) {
       // All done
      //console.log('courts available',courtsModel)
       if(!err)
        sendResponse(null, courtsModel);
   });
}

var prepareTimeArray = function(timeArr, sendResponse){
  var timeModel = [];
  var hours, minutes, seconds;
  async.each(timeArr, function(item, callback){
   var date = new Date(item);
   date.getUTCHours() === 0 ? hours = "00" : hours = date.getUTCHours()
   date.getUTCMinutes() === 0 ? minutes = "00" : minutes = date.getUTCMinutes()
   date.getUTCSeconds() === 0 ? seconds = "00" : seconds = date.getUTCSeconds()
   var timeSlot = hours+":"+minutes+":"+seconds;
    timeModel.push({
      "content_type":"text",
      "title": timeSlot,
      "payload": timeSlot
    });
    callback();
  }, function(err){
    if(!err) sendResponse(null, timeModel);
  })
}

module.exports = {
  sanitizeDate : sanitizeDate,
  prepareCourtsJson : prepareCourtsJson,
  prepareTimeArray : prepareTimeArray
}
