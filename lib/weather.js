var config = require("../config/index.js");

const http = require("http");

var Weather = function(){

	this.forecast = function(lat, lng, callback){

		var url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lng + "&appid=" + config.weather.api_key;

		var req = http.get(url, function(res){

			var body = "";

			res.on("data", function(chunk){
				body += chunk;
			})

			res.on("end", function(){
				var results = JSON.parse(body);
				if(results.cod == "200"){
					callback(false, results.list);
				} else {
					var error = new Error("Could not find weather");
					callback(error, []);
				}
			})
		});
		req.on("error", function(error){
			callback(error, {});
		});
		req.end();
	}


}

module.exports = Weather;