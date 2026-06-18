// controllers/authController.js
// Handles Registration, Login, Logout, and Profile queries using HTTP-only cookies for JWT storage.

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendMail } = require("../config/mail");
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

  // 4. Generate email verification token and expiration (expires in 24 hours)
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // 5. Create User (username is required by DB schema)
  const user = await User.create({
    username: username || name,
    name: name || username,
    email,
    password: hashedPassword,
    isVerified: false, // User is unverified by default
    verificationToken,
    verificationTokenExpires,
  });

  // 6. Send the verification email using Nodemailer config helper
  const verificationLink = `${req.protocol}://${req.get("host")}/api/auth/verify-email/${verificationToken}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Welcome to T-ZONE! ⌚</h2>
      <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #f59e0b; color: black; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Verify Email Address</a>
      </div>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p><a href="${verificationLink}">${verificationLink}</a></p>
      <p style="color: #777; font-size: 12px;">This link will expire in 24 hours. If you did not sign up for an account, please ignore this email.</p>
    </div>
  `;

  await sendMail({
    to: user.email,
    subject: "T-ZONE - Verify Your Email Address",
    html: htmlContent,
  });

  // 7. Respond to frontend
  return res.status(201).json({
    success: true,
    message: "Registration successful! Please check your email to verify your account.",
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

  // 4. Check Verification Status
  if (!user.isVerified) {
    throw new AppError("Please verify your email address to log in.", 400);
  }

  // 5. Check Blocked Status
  if (user.isBlocked) {
    throw new AppError("Your account has been temporarily blocked", 403);
  }

  // 6. Generate and Set Token Cookie
  const token = generateToken(user);
  sendCookie(res, token);

  // 7. Return response
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
      isVerified: true, // Google accounts are pre-verified
    });
  } else if (!user.isVerified) {
    // If the user registered manually before but didn't verify, logging in via Google proves ownership of the email
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
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

// 🔹 Verify Email Address
// Path: GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  // 1. Find the user who has this verification token and make sure it hasn't expired yet
  // We use the $gt (greater than) operator to check if the expiration date is in the future.
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  // 2. If no user is found with this token or the token has expired, return an error
  if (!user) {
    throw new AppError("Invalid or expired email verification token. Please register again.", 400);
  }

  // 3. Mark the user as verified and clear the token fields so they cannot be reused
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  // 4. Save the updated user document to the database
  await user.save();

  // 5. Send a success JSON response to the user
  return res.status(200).json({
    success: true,
    message: "Email verified successfully! You can now log in.",
  });
};

// 🔹 Request Password Reset (Forgot Password)
// Path: POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // 1. Check if email was provided in the request
  if (!email) {
    throw new AppError("Please provide an email address", 400);
  }

  // 2. Look up the user by email in the database
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("No user registered with this email address", 404);
  }

  // 3. Generate a secure, unique random token for password reset
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 4. Save the reset token and an expiration time (expires in 1 hour) to the user model
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour from now
  await user.save();

  // 5. Build the password reset URL (pointing to the frontend reset password page)
  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  // 6. Define the HTML email template with instructions
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Password Reset Request 🔑</h2>
      <p>You requested to reset your password. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #f59e0b; color: black; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p style="color: #777; font-size: 12px;">This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
    </div>
  `;

  // 7. Send the email using our Nodemailer transporter
  await sendMail({
    to: user.email,
    subject: "T-ZONE - Password Reset Request",
    html: htmlContent,
  });

  // 8. Respond to the client
  return res.status(200).json({
    success: true,
    message: "Password reset link has been sent to your email.",
  });
};

// 🔹 Perform Password Reset
// Path: POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // 1. Validate the password input
  if (!password) {
    throw new AppError("Please provide a new password", 400);
  }

  // 2. Find the user with matching reset token and check if it is still valid (not expired)
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  // 3. If no user found or token expired, return an error
  if (!user) {
    throw new AppError("Invalid or expired password reset token", 400);
  }

  // 4. Hash the new password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;

  // 5. Clear the reset token fields so they can't be used again
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  // 6. Save the user document
  await user.save();

  // 7. Respond with a success message
  return res.status(200).json({
    success: true,
    message: "Password reset successfully! You can now log in with your new password.",
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
};