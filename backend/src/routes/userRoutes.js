const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorize, authorizeSelfOrAdmin } = require("../middleware/roleMiddleware");
const {
  getUserById,
  updateUser,
} = require("../controllers/userController");

const {
  getAllUsers,
  deleteUser,
} = require("../controllers/adminController/adminUserController");

router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/:id", protect, authorizeSelfOrAdmin, getUserById);
router.patch("/:id", protect, authorizeSelfOrAdmin, updateUser);
router.put("/:id", protect, authorizeSelfOrAdmin, updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
