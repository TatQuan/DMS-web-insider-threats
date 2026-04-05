const { Route } = require("express");
const homeController = require("../controllers/homeController.js");
const router = require("express").Router();

router.get("/", homeController.getHomePage);

module.exports = router;
