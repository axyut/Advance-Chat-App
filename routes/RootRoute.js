const express = require("express");
const router = express.Router();
const AuthRouter = require("./auth_route");

const { logoutAPI, registerAPI, loginAPI } = require("../controllers/userAPI");

const {
	homePage,
	loginPage,
	chatAnonymousPage,
	registerPage,
	anynomousPage,
	secretsPage,
} = require("../controllers/root");

// Pages
router.get("/", homePage);
router.get("/login", loginPage);
router.get("/chat-anynomous", chatAnonymousPage);
router.get("/anynomous", anynomousPage);
router.get("/secrets", secretsPage);
router.get("/register", registerPage);

// Services
router.get("/logout", logoutAPI);
router.post("/register", registerAPI);
router.post("/login", loginAPI);

// Other Routes
router.use("/auth", AuthRouter);

module.exports = router;
