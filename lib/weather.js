var config = require("../config/index.js");

const http = require("http");

var Weather = function(){

	this.options = {
		protocol: "http:",
		host: "api.openweathermap.org",
		port: 80,
		method: "GET"
	};

	this.forecast = function(lat, lng, callback){

		this.options.path = "/data/2.5/forecast?lat=" + lat + "&lon=" + lng + "&appid=" + config.weather.api_key;

		var req = http.request(this.options, function(res){
			res.on("data", function(data){
				var results = JSON.parse(data);
				if(results.cod == "200"){
					callback(false, result.list);
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