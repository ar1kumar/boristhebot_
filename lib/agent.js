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
	indoor: {type: Boolean, default: false},
	loc: {
		type: [Number],
		index: "2d"
	}
});

var userSchema = mongoose.Schema({
	sender_id: String,
	postcode: String
});

var resultSchema = mongoose.Schema({
	players: Array,
	winner: String,
	timestamp: Date
});

bookingSchema.statics.findBooking = function(sender_id, status, callback){
	return this.find({sender_id: sender_id, status: status}, callback);
}

courtSchema.statics.getClosest = function(lng, lat, radius, callback){
	var coords = [lng, lat];
		radius /= 6371;
	return this.find({loc: {$near: coords, $maxDistance: radius}}, callback);
}
courtSchema.statics.getClosestIndoor = function(lng, lat, radius, callback){
	var coords = [lng, lat];
		radius /= 6371;
	return this.find({loc: {$near: coords, $maxDistance: radius}, indoor: true}, callback);
}


var Booking = mongoose.model("Booking", bookingSchema);
var Court = mongoose.model("Court", courtSchema);
var User = mongoose.model("User", userSchema);


var Agent = function(){

	this.searchRadius = 10;


	this.getNearestCourt = function(sender_id, postcode, radius, callback){

		var gmap = new GMap(),
			radius = radius || this.searchRadius;

		gmap.geocode(postcode, function(error, location){
			if(error){
				callback(error, []);
			} else {
				Court.getClosest(location.lng, location.lat, radius, function(error, courts){
					if(error){
						callback(error, []);
					} else {
						this.startBooking(sender_id, postcode, courts, callback);
					}
				});
			}
		});
	}

	this.checkAvailability = function(sender_id, court_id, callback){

		Court.findOne({_id: court_id}, function(error, court){
			callback(error, court);
		});

	}

	this.startBooking = function(sender_id, postcode, courts, callback){
		var booking = new Booking({
			sender_id: sender_id,
			postcode: postcode
		});

		var user = new User({
			sender_id: sender_id,
			postcode: postcode
		});

		booking.save(function(error){
			if(error){
				callback(error, courts);
			} else {
				user.save(function(error){
					callback(error, courts);
				});
			}
		});
		
	}

	this.bookCourt = function(sender_id, court_id, date, courts, callback){

		Booking.findBooking(sender_id, 0, function(error, booking){
			booking.court_id = court_id;
			booking.bookingDate = date;
			booking.status = 1;

			booking.save(function(error){
				if(error){
					callback(error);
				} else {
					callback();
				}
			});

		});

	}

}

module.exports = Agent;
