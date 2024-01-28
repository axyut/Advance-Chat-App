const passport = require("passport");

const googleAuthentication = async (req, res) => {
	passport.authenticate("google", { scope: ["email", "profile"] });
};

const googleSecret = async (req, res) => {
	passport.authenticate("google", {
		successRedirect: "/secrets",
		failureRedirect: "/",
	});
};

module.exports = { googleAuthentication, googleSecret };
