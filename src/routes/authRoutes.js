const { Route } = require("express");
const authController = require("../controllers/authController.js");
const router = require("express").Router();

router.get("/login", authController.loginGet);
router.post("/login", authController.loginPost);
router.get("/logout", authController.logout);

module.exports = router;
