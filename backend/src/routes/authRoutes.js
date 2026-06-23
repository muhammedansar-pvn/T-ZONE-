const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  logout,
  getProfile,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshSession,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.post("/google-login", googleLogin);
router.post("/refresh", refreshSession);
router.get("/profile", protect, getProfile);

// Email verification and password reset routes
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

module.exports = router;