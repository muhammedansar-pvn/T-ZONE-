

const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const protect = (req, res, next) => {
  try {
    let token = null;


    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

 
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    
    if (!token) {
      throw new AppError("Access Denied: No token provided", 401);
    }

   
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

   
    req.user = decodedPayload;


    next();
  } catch (error) {
   
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new AppError("Access Denied: Invalid or expired token", 401));
    } else {
      next(error);
    }
  }
};

module.exports = protect;