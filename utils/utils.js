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

var prepareCourtsJson = function(input){
  var courtsModel = [];
  async.forEachSeries(input, function(item, callback) {
    courtsModel.push({
      "title": item.name,
      "image_url": item.images[0],
      "subtitle": item.address,
      "buttons":[
        {
          "type":"postback",
          "title":"Book Now",
          "payload": courtsModel.length
        }
      ]
    })
   }, function(err) {
       // All done
       if(!err)
        return courtsModel;
      return [];
   });
}

module.exports = {
  sanitizeDate : sanitizeDate,
  prepareCourtsJson : prepareCourtsJson
}
