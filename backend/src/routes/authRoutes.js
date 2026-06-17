const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  logout,
  getProfile,
  googleLogin,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/google-login", googleLogin);
router.get("/profile", protect, getProfile);

router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

module.exports = router;