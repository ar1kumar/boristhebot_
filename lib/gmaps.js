var config = require("./config/index.js");

const http = require("http");

var GMap = function(){

	this.options = {
		protocol: "https",
		host: "maps.googleapis.com",
		port: 443,
		method: "GET"
	};

	this.geocode = function(postcode, callback){
		this.options.path = "/maps/api/geocode/json?address=" + postcode + "&key=" + config.google.api_key;

		var req = http.request(options, function(res){
			res.on("data", function(data){
				var results = JSON.parse(data);
				if(results.length > 0){
					var result = results[0];
					// var lng = result.geometry.location.lng,
						// lat = result.geometry.location.lat;
					callback(false, result.geometry.location);
				} else {
					callback("Could not find postcode", {});
				}
			})
		});
		req.on("error", function(e){
			callback(e.message, {});
		});
		req.end();
	}


}

module.exports = GMap;