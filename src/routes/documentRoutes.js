const { Route } = require("express");
const documentController = require("../controllers/documentController.js");
const router = require("express").Router();

router.get("/upload", documentController.getDocuments);

module.exports = router;
