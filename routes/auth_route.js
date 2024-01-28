const express = require("express");
const {
	googleAuthentication,
	googleSecret,
} = require("../controllers/authService");
const router = express.Router();

router.get("/google", googleAuthentication);
router.get("/google/secrets", googleSecret);

module.exports = router;
