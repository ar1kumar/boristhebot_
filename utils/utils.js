//import date exraction module
var chrono = require('chrono-node');

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

}

module.exports = {
  sanitizeDate : sanitizeDate,
  prepareCourtsJson : prepareCourtsJson
}
