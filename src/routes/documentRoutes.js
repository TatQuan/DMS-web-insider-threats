const { Route } = require("express");
const documentController = require("../controllers/documentController.js");
const router = require("express").Router();

router.get("/", documentController.getDocuments);
router.get("/upload-file", documentController.uploadDocument);

module.exports = router;
