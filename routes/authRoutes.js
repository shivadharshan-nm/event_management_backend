const express = require("express");
const router = express.Router();
const { login, verifyUser } = require("../controllers/authController");

router.post("/login", login);
router.use(verifyUser); // Protect routes after login

module.exports = router;
