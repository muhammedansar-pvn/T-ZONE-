// controllers/authController.js
// Handles Registration, Login, Logout, Profile, Email Verification, and Forgot Password features.
// Designed with clean, simplified logic and beginner-friendly inline comments.

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMail } = require("../config/mail");
const AppError = require("../utils/AppError");

// Helper: Generate Access JWT Token for sessions (expires in 15m)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Helper: Generate Refresh JWT Token for sessions (expires in 7d)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// Helper: Set Access JWT token as an HTTP-only browser cookie
const sendAccessTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

// Helper: Set Refresh JWT token as an HTTP-only browser cookie
const sendRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// 🔹 Register User
// Path: POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, username, email, password, mobile, address } = req.body;

  // 1. Check required inputs
  if ((!name && !username) || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  // 2. Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  // 3. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create verification token (expires in 24 hours)
  const token = crypto.randomBytes(20).toString("hex");
  const expires = Date.now() + 24 * 60 * 60 * 1000;

  const autoVerify = process.env.AUTO_VERIFY === "true" || process.env.NODE_ENV !== "production";

  // 5. Create user account
  const user = await User.create({
    username: username || name,
    name: name || username,
    email,
    password: hashedPassword,
    mobile: mobile || "",
    address: address || "",
    isVerified: autoVerify, // Auto-verified if not in production or configured
    verificationToken: autoVerify ? undefined : token,
    verificationTokenExpires: autoVerify ? undefined : expires,
  });

  // 6. Send simple verification email (skip if auto-verified)
  if (!autoVerify) {
    const link = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${token}`;
    await sendMail({
      to: user.email,
      subject: "Verify your email address",
      html: `<h3>Welcome to T-ZONE!</h3>
             <p>Click the link below to verify your email and activate your account:</p>
             <p><a href="${link}">${link}</a></p>`,
    });
  }

  return res.status(201).json({
    success: true,
    message: autoVerify
      ? "Registration successful! You can now log in."
      : "Registration successful! Please check your email to verify.",
  });
};

// 🔹 Login User
// Path: POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // 1. Find user and match password
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password", 400);
  }

  // 2. Enforce email verification status
  if (!user.isVerified) {
    throw new AppError("Please verify your email address to log in.", 400);
  }

  // 3. Prevent blocked users
  if (user.isBlocked) {
    throw new AppError("Your account is blocked", 403);
  }

  // 4. Generate access and refresh tokens, and save refresh token in DB
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  sendAccessTokenCookie(res, accessToken);
  sendRefreshTokenCookie(res, refreshToken);

  return res.json({
    success: true,
    token: accessToken,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// 🔹 Logout User
// Path: POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: "" } });
    }
  } catch (err) {
    // Ignore verification or database errors during logout
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({ success: true, message: "Logged out successfully" });
};

// 🔹 Get User Profile
// Path: GET /api/auth/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return res.json({ success: true, user });
};

// 🔹 Google Login / Sign Up
// Path: POST /api/auth/google-login
const googleLogin = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    throw new AppError("Email is required for Google Sign-In", 400);
  }

  let user = await User.findOne({ email });

  // 1. Auto-create account if Google user does not exist
  if (!user) {
    const dummyPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    user = await User.create({
      username: email.split("@")[0] + "_" + Math.floor(1000 + Math.random() * 9000),
      name: name || email.split("@")[0],
      email: email,
      password: hashedPassword,
      role: "user",
      isVerified: true, // Google email is already verified
    });
  } else if (!user.isVerified) {
    // Auto-verify if user logs in via Google later
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  }

  if (user.isBlocked) {
    throw new AppError("Your account is blocked", 403);
  }

  // Generate access and refresh tokens, and save refresh token in DB
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  sendAccessTokenCookie(res, accessToken);
  sendRefreshTokenCookie(res, refreshToken);

  return res.json({
    success: true,
    token: accessToken,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// 🔹 Verify Email
// Path: GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  // Find user by valid, unexpired token
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification link", 400);
  }

  // Mark verified and clear tokens
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return res.json({ success: true, message: "Email verified successfully! You can now log in." });
};

// 🔹 Forgot Password
// Path: POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("No user found with this email", 404);
  }

  // Generate 1-hour reset token
  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  // Send simple reset email
  const link = `http://localhost:5173/reset-password/${token}`;
  await sendMail({
    to: user.email,
    subject: "Reset your password",
    html: `<p>Click the link below to reset your password. Valid for 1 hour:</p>
           <p><a href="${link}">${link}</a></p>`,
  });

  return res.json({ success: true, message: "Password reset link sent to your email." });
};

// 🔹 Reset Password
// Path: POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new AppError("New password is required", 400);
  }

  // Find user with matching, valid reset token
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  // Hash new password and clear token fields
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.json({ success: true, message: "Password reset successfully! You can now log in." });
};

// 🔹 Refresh Token Session
// Path: POST /api/auth/refresh
const refreshSession = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError("Access Denied: No refresh token provided", 401);
  }

  let decodedPayload;
  try {
    decodedPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Access Denied: Invalid or expired refresh token", 401);
  }

  const user = await User.findById(decodedPayload.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("Access Denied: Invalid or revoked session", 401);
  }

  if (user.isBlocked) {
    throw new AppError("Your account is blocked", 403);
  }

  const accessToken = generateAccessToken(user);
  sendAccessTokenCookie(res, accessToken);

  return res.json({
    success: true,
    token: accessToken,
  });
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  getProfile,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshSession,
};