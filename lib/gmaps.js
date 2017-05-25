var config = require("../config/index.js");

const https = require("https");

var GMap = function(){

	this.geocode = function(postcode, callback){
		var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + postcode + "&key=" + config.google.api_key;

		var req = https.get(url, function(res){

			var body = "";

			res.on("data", function(chunk){
				body += chunk;
			});

			res.on("end", function(){
				var data = JSON.parse(body);
				var results = data.results;
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
