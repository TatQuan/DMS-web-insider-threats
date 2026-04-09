const { Route } = require("express");
const dashboardController = require("../controllers/dashboardController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = require("express").Router();

router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  dashboardController.dashboardGet,
);

module.exports = router;
