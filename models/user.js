const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const Schema = new mongoose.Schema({
	username: String,
	password: String,
	googleId: String,
});
Schema.plugin(passportLocalMongoose);
Schema.plugin(findOrCreate);

module.exports = mongoose.model("User", Schema);
