var config = require("../config/index.js"),
	GMap = require("./gmaps.js");

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
	bookingDate: Date,
	frequency: {type: Number, default: 1},
	court_id: mongoose.Schema.Types.ObjectId,
	friends: {type: Array, default: []},
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
	return this.find({sender_id: sender_id, status: 1}, callback);
}

courtSchema.statics.getClosest = function(lng, lat, radius, callback){
	var coords = [lng, lat];
		radius /= 6371;
	return this.find({loc: {$near: coords, $maxDistance: radius}}, callback);
}

var Booking = mongoose.model("Booking", bookingSchema);
var Court = mongoose.model("Court", courtSchema);


var Agent = function(){

	this.searchRadius = 10;


	this.getNearestCourt = function(postcode, callback){

		var gmap = new GMap(),
			radius = this.searchRadius;

		gmap.geocode(postcode, function(error, location){
			if(error){
				callback(error, []);
			} else {
				Court.getClosest(location.lng, location.lat, radius, function(error, courts){
					if(error){
						callback(error, []);
					} else {
						callback(false, courts);
					}
				});
			}
		});
	}

	this.checkAvailability = function(sender_id, court_id, callback){

	}


	this.bookCourt = function(sender_id, court_id, date, callback){

		var booking = new Booking({
			sender_id: sender_id,
			court_id: court_id,
			bookingDate: date
		});

		booking.save(function(error){
			if(error){
				callback(error);
			} else {
				callback();
			}
		});

	}

}

module.exports = Agent;
