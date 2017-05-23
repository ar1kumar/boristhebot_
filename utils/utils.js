//import date exraction module
var chrono = require('chrono-node');

var sanitizeDate = function(input, callback){
  if(input){
    callback(null, chrono.parseDate(input));
  }
}

module.exports = {
  sanitizeDate : sanitizeDate
}
