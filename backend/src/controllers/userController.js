


const User = require("../models/User");
const AppError = require("../utils/AppError");



const getUserById = async (req, res) => {
  const userId = req.params.id;
  
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  return res.json(user);
};



const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, mobile, address, isBlocked } = req.body;

  
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  
  if (name !== undefined) {
    user.name = name;
    user.username = name; 
  }
  if (mobile !== undefined) {
    user.mobile = mobile;
  }
  if (address !== undefined) {
    user.address = address;
  }
  if (isBlocked !== undefined) {
    if (req.user.role !== "admin") {
      throw new AppError("Access Denied: Only administrators can modify block status", 403);
    }
    user.isBlocked = isBlocked;
  }

  
  await user.save();

  return res.json(user);
};

module.exports = {
  getUserById,
  updateUser,
};
