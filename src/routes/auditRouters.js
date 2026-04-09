const auditController = require("../controllers/auditController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const CheckLockStatus = require("../middleware/checkLockStatus.js");
const router = require("express").Router();

router.get(
  "/",
  authMiddleware.verifyToken,
  CheckLockStatus,
  auditController.auditGet,
);

module.exports = router;
