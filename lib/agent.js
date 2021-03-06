var config = require("../config/index.js"),
	GMap = require("./gmaps.js"),
	Weather = require("./weather.js");

var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');

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
	court_id: mongoose.Schema.Types.ObjectId,
	friends: {type: Array, default: []},
	status: {type: Number, default: 0},
	reminder: {type: Number, default: 0},
	timestamp: {type: Date, default: Date.now}
});

var courtSchema = mongoose.Schema({
	name: String,
	address: String,
	indoor: {type: Boolean, default: false},
	loc: {
		type: [Number],
		index: "2dsphere"
	},
	images: Array
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
	return this.findOne({sender_id: sender_id, status: status}).sort({timestamp: -1}).exec(callback);
}
bookingSchema.statics.findAnyBooking = function(sender_id, callback){
	return this.findOne({sender_id: sender_id}).sort({timestamp: -1}).exec(callback);
}
bookingSchema.statics.findBookingById = function(booking_id, callback){
	return this.findById(booking_id, callback);
}
bookingSchema.statics.findAllBookingsOnDate = function(date, status, callback){
	var date = new Date(date);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);

	var start, end;
		start = end = date;
		end.setHours(24);

	return this.find({bookingDate: {"$gte": start, "$lt": end}, status: status, reminder: 1}).sort({bookingDate: 1}).exec(callback);
}
bookingSchema.statics.findBookingsOnDate = function(date, court_id, approx, callback){
	var date = new Date(date);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);

	var start = end = date;
	switch(approx.replace(/\s/g, "").toUpperCase()){
		case "BF":
			start.setHours(0);
			end.setHours(9);
			break;
		case "LUN":
		default:
			start.setHours(9);
			end.setHours(18);
			break;
		case "AF":
			start.setHours(18);
			end.setHours(24);
			break;
	}

	return this.find({bookingDate: {"$gte": start, "$lt": end}, court_id: court_id}).sort({bookingDate: 1}).exec(callback);
}

courtSchema.statics.findCourtById = function(court_id, callback){
	return this.findById(court_id, callback);
}
courtSchema.statics.getClosest = function(lng, lat, radius, callback){
	var coords = [lng, lat];
		radius /= 6378.1;
	return this.find().where("loc").near({center: coords, maxDistance: radius, spherical: true}).exec(callback);
}
courtSchema.statics.getClosestIndoor = function(lng, lat, radius, callback){
	var coords = [lng, lat];
		radius /= 6378.1;
	return this.find({indoor: true}).where("loc").near({center: coords, maxDistance: radius, spherical: true}).exec(callback);
}

userSchema.statics.findUser = function(sender_id, callback){
	return this.findOne({sender_id: sender_id}, callback);
}


var Booking = mongoose.model("Booking", bookingSchema);
var Court = mongoose.model("Court", courtSchema);
var User = mongoose.model("User", userSchema);


var Agent = function(){

	this.searchRadius = 10;
	this.defaultOpeningHour = 6;
	this.defaultClosingHour = 23;

	this.getNearestCourtFromPostcode = function(sender_id, postcode, radius, callback){

		var gmap = new GMap(),
			radius = radius || this.searchRadius,
			regex = /([A-PR-UWYZ]([A-HK-Y][0-9]([0-9]|[ABEHMNPRV-Y])?|[0-9]([0-9]|[A-HJKPSTUW])?) ?[0-9][ABD-HJLNP-UW-Z]{2})/,
			postcode = postcode.replace(/\s/g, "").toUpperCase(),
			self = this;

		if(regex.test(postcode)){
			gmap.geocode(postcode, function(error, location){
				if(error){
					callback(error, []);
				} else {
					Court.getClosest(location.lng, location.lat, radius, function(error, courts){
						if(error || !courts){
							callback(error, courts);
						} else {
							self.updateBooking(sender_id, postcode, courts, callback);
						}
					});
				}
			});
		} else {
			var error = new Error("Invalid postcode");
			callback(error, []);
		}

	}
	this.getNearestCourtFromLocation = function(sender_id, coords, radius, callback){

		var self = this;
		radius = radius || this.searchRadius;

		Court.getClosest(coords.long, coords.lat, radius, function(error, courts){
			if(error || !courts){
				callback(error, courts);
			} else {
				self.updateBooking(sender_id, "", courts, callback);
			}
		});
	}

	this.getBookingsToday = function(callback){
		var today = new Date();
		Booking.findAllBookingsOnDate(today.getTime(), 1, function(error, bookings){
			callback(error, bookings);
		});
	}
	this.getFutureBookings = function(callback){
		var today = new Date();
		today.setDate(today.getDate()+2);
		Booking.findAllBookingsOnDate(today.getTime(), 1, function(error, bookings){
			callback(error, bookings);
		});
	}

	this.checkWeatherForUser = function(sender_id, callback){
		var gmap = new GMap(),
			weather = new Weather(),
			self = this;

		Booking.findBooking(sender_id, 1, function(error, booking){
			if(error || !booking){
				callback(error, {});
			} else {

				gmap.geocode(booking.postcode, function(error, location){
					if(error){
						callback(error, {});
					} else {

						weather.forecast(location.lng, location.lat, function(error, forecasts){
							if(error){
								callback(error, {});
							} else {

								var forecast = self.getForecastForDate(forecasts, booking.bookingDate);
								callback(false, forecast);

							}
						});

					}
				});

			}
		});

	}
	this.checkWeatherForBooking = function(booking_id, callback){
		var gmap = new GMap(),
			weather = new Weather(),
			self = this;

		Booking.findBookingById(booking_id, function(error, booking){
			if(error || !booking){
				callback(error, {});
			} else {

				gmap.geocode(booking.postcode, function(error, location){
					if(error){
						callback(error, {});
					} else {

						weather.forecast(location.lng, location.lat, function(error, forecasts){
							if(error){
								callback(error, {});
							} else {

								var forecast = self.getForecastForDate(forecasts, booking.bookingDate);
								callback(false, forecast);

							}
						});

					}
				});

			}
		});

	}

	this.getForecastForDate = function(forecasts, bookingDate){
		var date = new Date(bookingDate),
			weather = {};
		for(var i=0;i<forecasts.length;i++){
			var forecast = forecasts[i];
			var tempDate = new Date(forecast.dt_txt);
			if(tempDate > date){
				break;
			}
		}
		return i >= 0 ? forecasts[i] : {};
	}

	this.checkAvailability = function(sender_id, court_id, callback){

		Court.findOne({_id: court_id}, function(error, court){
			callback(error, court);
		});

	}

	this.getBooking = function(sender_id, callback){

		Booking.findAnyBooking(sender_id, function(error, booking){
			if(error){
				callback(error, null, null);
			} else {
				if(!booking){
					var error = new Error("Could not find booking");
					callback(error, null, null);
				} else {
					Court.findCourtById(booking.court_id, function(error, court){
						callback(error, booking, court);
					});					
				}
			}
		});

	}
	this.getBookingDetailsByID = function(booking_id, callback){

		Booking.findBookingById(booking_id, function(error, booking){
			if(error || !booking){
				callback(error, null, null);
			} else {
				Court.findCourtById(booking.court_id, function(error, court){
					callback(error, booking, court);
				});
			}
		});

	}

	this.getCourtById = function(court_id, callback){
		Court.findCourtById(court_id, function(error, court){
			callback(error, court);
		});
	}

	this.inviteToBooking = function(sender_id, booking_id, callback){

		Booking.findBookingById(booking_id, function(error, booking){
			if(error || !booking){
				callback(error, null);
			} else {
				booking.friends.push(sender_id);
				booking.save(function(error){
					callback(error, booking.sender_id);
				});
			}
		});

	}

	this.startBooking = function(sender_id, date, callback){

		Booking.findBooking(sender_id, 0, function(error, booking){
			if(error || !booking){

				var booking = new Booking({
					sender_id: sender_id
				});

			}

			booking.desiredDate = new Date(date);
			booking.save(function(error){
				callback(error);
			});

		});

	}
	this.updateBooking = function(sender_id, postcode, courts, callback){

		var self = this;

		Booking.findBooking(sender_id, 0, function(error, booking){
			if(error || !booking){
				callback(error, courts);
			} else {

				booking.postcode = postcode;
				booking.save(function(error){
					if(error){
						callback(error, courts);
					} else {

						self.saveUser(sender_id, postcode, courts, callback);

					}
				});

			}
		});

	}

	this.editBooking = function(sender_id, bookingDate, callback){
		Booking.findBooking(sender_id, 1, function(error, booking){
			if(error || !booking){
				callback(error, booking, null);
			} else {
				booking.bookingDate = bookingDate;
				booking.save(function(error){
					if(error){
						callback(error, booking, null);
					} else {
						Court.findCourtById(booking.court_id, function(error, court){
							callback(error, booking, court);
						});
					}
				});
			}
		});
	}

	this.saveUser = function(sender_id, postcode, courts, callback){

		User.findUser(sender_id, function(error, user){
			if(error || !user){
				var user = new User({
					sender_id: sender_id
				});
			}

			user.postcode = postcode;
			user.save(function(error){
				callback(error, courts);
			});
		})

	}

	this.setReminder = function(sender_id, callback){
		Booking.findBooking(sender_id, 1, function(error, booking){
			if(error){
				callback(error);
			} else {
				if(!booking){
					var error = new Error("Could not find booking");
					callback(error);
				} else {
					booking.reminder = 1;
					booking.save(function(error){
						callback(error);
					});
				}
			}
		})
	}

	this.bookCourt = function(sender_id, court_id, date, callback){

		Booking.findBooking(sender_id, 0, function(error, booking){
			if(error || !booking){
				callback(error, null);
			} else {

				booking.court_id = court_id;
				booking.bookingDate = new Date(date);
				booking.status = 1;

				booking.save(function(error){
					callback(error, booking);
				});

			}

		});

	}

	this.checkCourtAvailability = function(date, court_id, callback){
		var date = new Date(date),
			now = new Date(),
			approx;

		if(Math.floor((date.getTime() - now.getTime())/(1000*60*60)) < 1){
			var error = new Error("Sorry, this court is not available at that time");
			callback(error);
		} else {
			switch(true){
				case date.getHours() >= 0 && date.getHours() < 9:
					approx = "BF";
					break;
				case date.getHours() >= 9 && date.getHours() < 18:
				default:
					approx = "LUN";
					break;
				case date.getHours() >= 18 && date.getHours() < 24:
					approx = "AF";
					break;
			}

			Booking.findBookingsOnDate(date, court_id, approx, function(error, bookings){
				if(error){
					callback(error);
				} else {
					var available = true;
					for(var i=0; i<bookings.length; i++){
						var booking = bookings[i];
						var bookingDate = booking.bookingDate;
						if((Math.abs(date.getTime() - bookingDate.getTime())/(1000*60)) > 30){
							available = false;
							break;
						}
					}
					if(!available){
						error = new Error("Sorry, this court is not available at that time");
					}
					callback(error);
				}
			});			
		}

	}

	this.checkCourtTimes = function(date, approx, court_id, callback){
		var self = this,
			date = new Date(date);

		Booking.findBookingsOnDate(date, court_id, approx, function(error, bookings){
			if(error){
				callback(error, []);
			} else {

					bookingCounter = 0,
					availableTimes = [];

					var now = new Date();

					date.setHours(0);
					date.setMinutes(0);
					date.setSeconds(0);
					
					now = now.getTime() > date.getTime() ? now : date;

				switch(approx.replace(/\s/g, "").toUpperCase()){
					case "BF":
						startTime = Math.max(self.defaultOpeningHour, (now.getHours()+1));
						endTime = 9;
						break;
					case "LUN":
					default:
						startTime = Math.max(9, (now.getHours()+1));
						endTime = 18;
						break;
					case "AF":
						startTime = Math.max(18, (now.getHours()+1));
						endTime = self.defaultClosingHour;
						break;
				}

				for(var i=startTime; i<endTime; i++){
					var time = new Date(date.setHours(i));

					if(bookings.length){
						var booking = bookings[bookingCounter];
						var bookingDate = new Date(booking.bookingDate);

						if(bookingDate.getTime() == time.getTime()){
							bookingCounter++;
						} else {
							availableTimes.push(time);
						}
					} else {
						availableTimes.push(time);
					}
				}

				callback(false, availableTimes);

			}

		});

	}

}

module.exports = Agent;
