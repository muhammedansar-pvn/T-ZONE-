

const AppError = require("../utils/AppError");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
 
    if (!req.user) {
      return next(new AppError("Access Denied: You must be logged in", 401));
    }

    
    const userRole = req.user.role;
    const isAllowed = allowedRoles.includes(userRole);

    if (!isAllowed) {
      return next(new AppError("Access Denied: Insufficient permissions", 403));
    }

    
    next();
  };
};


const authorizeSelfOrAdmin = (req, res, next) => {

  if (!req.user) {
    return next(new AppError("Access Denied: You must be logged in", 401));
  }

  const loggedInUserId = String(req.user.id);
  const loggedInUserRole = req.user.role;
  const targetId = String(req.params.id);

  const isAdmin = loggedInUserRole === "admin";
  const isOwner = loggedInUserId === targetId;

  if (isAdmin || isOwner) {
    next();
  } else {
    return next(new AppError("Access Denied: You cannot manage other users' data", 403));
  }
};

module.exports = {
  authorize,
  authorizeSelfOrAdmin,
};
