const auditController = require("../controllers/auditController.js");
const router = require("express").Router();

router.get("/", auditController.auditGet);

module.exports = router;
