



const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMail } = require("../config/mail");
const AppError = require("../utils/AppError");
const { verifyFirebaseIdToken } = require("../utils/firebaseAuth");


const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};


const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};


const sendAccessTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
};


const sendRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
};



const registerUser = async (req, res) => {
  const { name, username, email, password, mobile, address } = req.body;

  
  if ((!name && !username) || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }

  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  
  const hashedPassword = await bcrypt.hash(password, 10);

  
  const token = crypto.randomBytes(20).toString("hex");
  const expires = Date.now() + 24 * 60 * 60 * 1000;

  const autoVerify = process.env.AUTO_VERIFY ? process.env.AUTO_VERIFY === "true" : process.env.NODE_ENV !== "production";

  
  const user = await User.create({
    username: username || name,
    name: name || username,
    email,
    password: hashedPassword,
    mobile: mobile || "",
    address: address || "",
    isVerified: autoVerify, 
    verificationToken: autoVerify ? undefined : token,
    verificationTokenExpires: autoVerify ? undefined : expires,
  });

  
  if (!autoVerify) {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const link = `${clientUrl}/verify-email/${token}`;
    try {
      await sendMail({
        to: user.email,
        subject: "Verify your email address",
        html: `<h3>Welcome to T-ZONE!</h3>
               <p>Click the link below to verify your email and activate your account:</p>
               <p><a href="${link}">${link}</a></p>`,
      });
    } catch (mailError) {
      console.error("Verification email sending failed:", mailError);
      await User.findByIdAndDelete(user._id);
      throw new AppError("Failed to send verification email. Please check if your email address is valid.", 500);
    }
  }

  return res.status(201).json({
    success: true,
    message: autoVerify
      ? "Registration successful! You can now log in."
      : "Registration successful! Please check your email to verify.",
  });
};



const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password", 400);
  }

  
  if (!user.isVerified) {
    throw new AppError("Please verify your email address to log in.", 400);
  }

  
  if (user.isBlocked) {
    throw new AppError("Your account is blocked", 403);
  }

  
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



const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: "" } });
    }
  } catch (err) {
    
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



const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return res.json({ success: true, user });
};



const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("ID Token is required for Google Sign-In", 400);
  }

  let decodedToken;
  try {
    decodedToken = await verifyFirebaseIdToken(idToken);
  } catch (error) {
    console.error("Google Token Verification Error:", error.message || error);
    throw new AppError(`Access Denied: Invalid Google ID Token (${error.message || error})`, 401);
  }

  const { email, name } = decodedToken;

  let user = await User.findOne({ email });

  if (!user) {
    const dummyPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    user = await User.create({
      username: email.split("@")[0] + "_" + Math.floor(1000 + Math.random() * 9000),
      name: name || email.split("@")[0],
      email: email,
      password: hashedPassword,
      role: "user",
      isVerified: true, 
    });
  } else if (!user.isVerified) {
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  }

  if (user.isBlocked) {
    throw new AppError("Your account is blocked", 403);
  }

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



const verifyEmail = async (req, res) => {
  let { token } = req.params;

  if (token) {
    token = token.trim();
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired verification link", 400);
  }

  
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  return res.json({ success: true, message: "Email verified successfully! You can now log in." });
};



const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("No user found with this email", 404);
  }

  
  const token = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const link = `${clientUrl}/reset-password/${token}`;
  await sendMail({
    to: user.email,
    subject: "Reset your password",
    html: `<p>Click the link below to reset your password. Valid for 1 hour:</p>
           <p><a href="${link}">${link}</a></p>`,
  });

  return res.json({ success: true, message: "Password reset link sent to your email." });
};



const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new AppError("New password is required", 400);
  }

  
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  
  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.json({ success: true, message: "Password reset successfully! You can now log in." });
};



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