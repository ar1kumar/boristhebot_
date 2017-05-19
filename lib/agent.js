var config = require("./config/index.js"),
	GMap = require("./lib/gmaps.js");

var mongoose = require("mongoose");
mongoose.connect(config.mongo.uri);

var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(){
	console.log("database locked in...");
});

var bookingSchema = mongoose.Schema({
	sender_id: String,
	postcode: String,
	desiredDate: Date,
	bookingDate: Date,
	frequency: {type: Number, default: 1},
	court_id: Schema.Types.ObjectId,
	friends: Array,
	status: {type: Number, default: 0},
	timestamp: {type: Date, default: Date.now}
});

var courtSchema = mongoose.Schema({
	name: String,
	address: String,
	loc: {
		type: [Number],
		index: "2d"
	}
});

bookingSchema.statics.findIncompleteBooking = function(sender_id, callback){
	return this.find({sender_id: sender_id, status: 0}, callback);
}
bookingSchema.statics.findCompleteBooking = function(sender_id, callback){
	return this.find({sender_id: sender_id, status: 0}, callback);
}

courtSchema.statics.getClosest = function(lng, lat, radius, callback){
	var coords = [lng, lat];
		radius /= 6371;
	return this.find({loc: {$near: coords, $maxDistance: radius}}, callback);
}

var Booking = mongoose.model("Booking", bookingSchema);
var Court = mongoose.model("Court", courtSchema);


var Agent = function(){


	this.getNearestCourt = function(sender_id, postcode, callback){

		var gmap = new GMap();
		
		gmap.geocode(postcode, function(error, location){
			if(error){
				callback(error, []);
			} else {
				Court.getClosest(location.lng, location.lat, 10, function(error, courts){
					if(error){
						callback(e.message, []);
					} else {
						callback(false, courts);
					}
				});
			}
		});
	}

	this.checkAvailability = function(sender_id, court_id, callback){


	}

	this.chooseDate = function(sender_id, date, callback){


	}

	this.chooseCourt = function(sender_id, court_id, callback){



	}

}

module.exports = Agent;