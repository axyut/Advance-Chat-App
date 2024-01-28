const User = require("../models/user");
const passport = require("passport");

const logoutAPI = async (req, res) => {
	req.logout(function (err) {
		if (!err) {
			res.redirect("/");
		} else {
			console.log(err);
			res.redirect("/login");
		}
	});
};

const registerAPI = async (req, res) => {
	User.register(
		{ username: req.body.username, password: req.body.password },

		function (err, User) {
			if (err) {
				console.log(err);
				res.redirect("/register");
			} else {
				passport.authenticate("local")(req, res, function () {
					res.json({ User });
				});
			}
		}
	);
};

const loginAPI = async (req, res) => {
	const user = new User({
		username: req.body.username,
		password: req.body.password,
	});

	req.login(user, function (err) {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secrets");
			});
		}
	});
};

module.exports = { logoutAPI, registerAPI, loginAPI };
