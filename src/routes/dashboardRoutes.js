const { Route } = require("express");
const dashboardController = require("../controllers/dashboardController.js");
const router = require("express").Router();

router.get("/", dashboardController.dashboardGet);

module.exports = router;
