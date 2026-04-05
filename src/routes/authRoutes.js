const { Route } = require("express");
const authController = require("../controllers/authController.js");
const router = require("express").Router();

router.get("/login", authController.getLoginPage);
router.post("/login", authController.login);

module.exports = router;
