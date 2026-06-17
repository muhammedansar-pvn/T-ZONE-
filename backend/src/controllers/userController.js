// controllers/userController.js
// This controller handles viewing user details and updating user profile or block status.

const User = require("../models/User");
const AppError = require("../utils/AppError");

// 🔹 Get a single user by their ID
// Path: GET /api/users/:id
const getUserById = async (req, res) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  return res.json(user);
};

// 🔹 Update user details (profile or block status)
// Path: PATCH /api/users/:id or PUT /api/users/:id
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, mobile, address, isBlocked } = req.body;

  // 1. Find the user record
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Explicitly apply the updates only if they were passed in the request body
  if (name !== undefined) {
    user.name = name;
    user.username = name; // Sync username and name
  }
  if (mobile !== undefined) {
    user.mobile = mobile;
  }
  if (address !== undefined) {
    user.address = address;
  }
  if (isBlocked !== undefined) {
    user.isBlocked = isBlocked;
  }

  // 3. Save the modified document
  await user.save();

  return res.json(user);
};

module.exports = {
  getUserById,
  updateUser,
};
