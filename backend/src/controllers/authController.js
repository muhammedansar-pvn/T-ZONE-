// controllers/authController.js
// Handles Registration, Login, Logout, and Profile queries using HTTP-only cookies for JWT storage.

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Set token in HTTP-only cookie
const sendCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// 🔹 Register User
// Path: POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, username, email, password } = req.body;

  // 1. Validation
  if ((!name && !username) || !email || !password) {
    throw new AppError("Please provide name/username, email, and password", 400);
  }

  // 2. Check duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists with this email", 400);
  }

  // 3. Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create User (username is required by DB schema)
  const user = await User.create({
    username: username || name,
    name: name || username,
    email,
    password: hashedPassword,
  });

  // 5. Generate and Set Token Cookie
  const token = generateToken(user);
  sendCookie(res, token);

  // 6. Respond with user details
  return res.status(201).json({
    success: true,
    message: "User registered and logged in successfully",
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
      isBlocked: user.isBlocked,
    },
  });
};

// 🔹 Login User
// Path: POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Validation
  if (!email || !password) {
    throw new AppError("Please enter both email and password", 400);
  }

  // 2. Find User
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 400);
  }

  // 3. Match Password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError("Invalid email or password", 400);
  }

  // 4. Check Blocked Status
  if (user.isBlocked) {
    throw new AppError("Your account has been temporarily blocked", 403);
  }

  // 5. Generate and Set Token Cookie
  const token = generateToken(user);
  sendCookie(res, token);

  // 6. Return response
  return res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
      isBlocked: user.isBlocked,
    },
  });
};

// 🔹 Logout User
// Path: POST /api/auth/logout
const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

// 🔹 Get User Profile
// Path: GET /api/auth/profile
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
      isBlocked: user.isBlocked,
    },
  });
};

// 🔹 Google Login / Sign Up
// Path: POST /api/auth/google-login
const googleLogin = async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email) {
    throw new AppError("Email is required for Google Sign-In", 400);
  }

  // 1. Check if user already exists
  let user = await User.findOne({ email });

  if (!user) {
    // 2. If user doesn't exist, create a new user account automatically
    const dummyPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    user = await User.create({
      username: email.split("@")[0] + "_" + Math.floor(1000 + Math.random() * 9000),
      name: name || email.split("@")[0],
      email: email,
      password: hashedPassword,
      role: "user",
    });
  }

  // 3. Check if user is blocked
  if (user.isBlocked) {
    throw new AppError("Your account has been temporarily blocked", 403);
  }

  // 4. Generate token and set in cookie
  const token = generateToken(user);
  sendCookie(res, token);

  return res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
      isBlocked: user.isBlocked,
    },
  });
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  getProfile,
  googleLogin,
};