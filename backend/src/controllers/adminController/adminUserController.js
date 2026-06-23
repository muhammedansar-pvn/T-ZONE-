

const User = require("../../models/User");
const AppError = require("../../utils/AppError");


const getAllUsers = async (req, res) => {
  const users = await User.find({ isDeleted: false }).select("-password").sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: users.length,
    users: users,
  });
};


const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!role || !["user", "admin"].includes(role)) {
    throw new AppError("Invalid role specified. Must be 'user' or 'admin'.", 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    user: user,
  });
};


const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  return res.status(200).json({
    success: true,
    message: `User has been successfully ${user.isBlocked ? "blocked" : "unblocked"}`,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isBlocked: user.isBlocked,
    },
  });
};

module.exports = {
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
};
