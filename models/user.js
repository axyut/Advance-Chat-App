const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
	username: {
		//email
		type: String,
		required: [true, "Email is required."],
		unique: true,
		tirm: true,
		minlength: 8,
		maxlength: 20,
	},
	password: {
		type: String,
		required: [true, "Password is required."],
		minlength: 8,
		maxlength: 20,
	},
	googleId: { type: String },
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);

// embedded data structures
// messages is array of objects
