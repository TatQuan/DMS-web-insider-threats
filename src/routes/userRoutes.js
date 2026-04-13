const userController = require("../controllers/userController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = require("express").Router();

router.get(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.viewUser,
);

router.post(
  "/create",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.createUser,
);

router.post(
  "/update/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.updateUser,
);

router.delete(
  "/delete/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.deleteUser,
);

router.lock(
  "/lock/:id",
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  userController.lockUser,
);

module.exports = router;
