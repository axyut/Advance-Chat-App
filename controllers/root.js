const homePage = (req, res) => {
	res.render("home");
};

const chatAnonymousPage = (req, res) => {
	res.render("chat-anynomous");
};
const anynomousPage = (req, res) => {
	res.render("anynomous");
};

const registerPage = (req, res) => {
	res.render("register");
};

const secretsPage = (req, res) => {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.redirect("/login");
	}
};

const loginPage = (req, res) => {
	res.render("login");
};

module.exports = {
	homePage,
	loginPage,
	chatAnonymousPage,
	registerPage,
	anynomousPage,
	secretsPage,
};
