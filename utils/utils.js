//import date exraction module
var chrono = require('chrono-node');

var sanitizeDate = function(input, callback){
  if(input){
    //var checkDate = chrono.parse(input);
    if(Object.prototype.toString.call(chrono.parse(input)[0].ref) === '[object Date]'){
      callback(null, chrono.parse(input)[0].ref);
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
