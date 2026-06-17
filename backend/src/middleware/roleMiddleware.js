// middleware/roleMiddleware.js
// This file contains middlewares that control access to routes based on user roles (e.g. "admin", "user").
// - authorize("admin"): Protects routes so only admin users can access them.
// - authorizeSelfOrAdmin: Protects routes so only the owner of the data OR an admin user can access them.

const AppError = require("../utils/AppError");

// Reusable role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if req.user exists (the user must be logged in via "protect" middleware first)
    if (!req.user) {
      return next(new AppError("Access Denied: You must be logged in", 401));
    }

    // 2. Check if the user's role is in the list of allowed roles
    const userRole = req.user.role;
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      return next(new AppError("Access Denied: Insufficient permissions", 403));
    }

    // 3. If allowed, call next()
    next();
  };
};

// Middleware to check if the user is accessing their own data or is an admin
const authorizeSelfOrAdmin = (req, res, next) => {
  // 1. Check if user is logged in
  if (!req.user) {
    return next(new AppError("Access Denied: You must be logged in", 401));
  }

  // 2. Get the logged-in user's details and the target URL parameter ID
  const loggedInUserId = String(req.user.id);
  const loggedInUserRole = req.user.role;
  const targetId = String(req.params.id);

  // 3. Check if user is admin OR if the logged-in user is editing/viewing their own record
  const isAdmin = loggedInUserRole === "admin";
  const isOwner = loggedInUserId === targetId;

  if (isAdmin || isOwner) {
    // Access is allowed!
    next();
  } else {
    // Access is denied!
    return next(new AppError("Access Denied: You cannot manage other users' data", 403));
  }
};

module.exports = {
  authorize,
  authorizeSelfOrAdmin,
};
