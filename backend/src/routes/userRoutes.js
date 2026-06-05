const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
