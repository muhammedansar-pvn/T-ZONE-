// utils/AppError.js
// Custom error class to handle operational errors with status codes and clean stack traces.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Flag to identify predictable operational errors vs programming bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
