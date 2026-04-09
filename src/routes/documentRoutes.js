const { Route } = require("express");
const documentController = require("../controllers/documentController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const CheckLockStatus = require("../middleware/checkLockStatus.js");
const upload = require("../middleware/uploadMiddleware.js");
const router = require("express").Router();

router.get(
  "/",
  authMiddleware.verifyToken,
  CheckLockStatus,
  documentController.viewDocument,
);
router.get(
  "/upload-file",
  authMiddleware.verifyToken,
  CheckLockStatus,
  documentController.uploadDocument,
);
router.get(
  "/download/:id",
  authMiddleware.verifyToken,
  CheckLockStatus,
  documentController.downloadDocument,
);

router.post(
  "/upload",
  authMiddleware.verifyToken,
  CheckLockStatus,
  upload.array("file", 10),
  documentController.uploadDocumentPost,
);

router.get(
  "/delete/:id",
  authMiddleware.verifyToken,
  CheckLockStatus,
  documentController.deleteDocument,
);

module.exports = router;
