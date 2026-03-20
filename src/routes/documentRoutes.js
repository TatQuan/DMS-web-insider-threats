const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const upload = require("../middleware/uploadMiddleware.js");
const checkLockStatus = require("../middleware/checkLockStatus.js");

// only handle URL và Middleware
router.get(
  "/",
  authMiddleware.verifyToken,
  checkLockStatus,
  documentController.getDocs,
);
router.post(
  "/upload",
  authMiddleware.verifyToken,
  upload.single("file"),
  documentController.uploadFile,
);

router.get(
  "/download/:id",
  authMiddleware.verifyToken,
  checkLockStatus,
  documentController.downloadFile,
);

router.delete("/:id", authMiddleware.verifyToken, documentController.deleteDoc);

router.get(
  "/recycle-bin",
  authMiddleware.verifyToken,
  documentController.getRecycleBin,
);

module.exports = router;
