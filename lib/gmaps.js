var config = require("../config/index.js");

const http = require("http");

var GMap = function(){

	this.options = {
		protocol: "https:",
		host: "maps.googleapis.com",
		port: 443,
		method: "GET"
	};

	this.geocode = function(postcode, callback){
		this.options.path = "/maps/api/geocode/json?address=" + postcode + "&key=" + config.google.api_key;

		var req = http.request(this.options, function(res){
			res.on("data", function(data){
				var results = JSON.parse(data);
				if(results.length > 0){
					var result = results[0];
					// var lng = result.geometry.location.lng,
						// lat = result.geometry.location.lat;
					callback(false, result.geometry.location);
				} else {
					var error = new Error("Could not find postcode");
					callback(error, {});
				}
			})
		});
		req.on("error", function(error){
			callback(error, {});
		});
		req.end();
	}


}

module.exports = GMap;
