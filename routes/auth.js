const express = require("express");
const { signup, login } = require("../controlers/auth");
const router = express.Router();

// Route for user signup
router.post("/signup", signup);

// Route for user login
router.post("/login", login);

module.exports = router;
