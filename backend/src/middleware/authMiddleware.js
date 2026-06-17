// middleware/authMiddleware.js
// This middleware protects routes. It checks if the request has a valid JWT token.
// It tries to read the token from cookies first, then falls back to the Authorization header.

const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const protect = (req, res, next) => {
  try {
    let token = null;

    // 1. Try to read token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Fallback to Authorization header
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 3. If no token, throw 401 AppError
    if (!token) {
      throw new AppError("Access Denied: No token provided", 401);
    }

    // 4. Verify the token using the secret key
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the decoded payload (contains id and role) to the request object
    req.user = decodedPayload;

    // 6. Proceed to the next middleware or controller
    next();
  } catch (error) {
    // Forward JWT verification errors to centralized error handler with 401
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new AppError("Access Denied: Invalid or expired token", 401));
    } else {
      next(error);
    }
  }
};

module.exports = protect;