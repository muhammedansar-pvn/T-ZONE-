// middleware/errorMiddleware.js
// Basic global error handling middleware that sends a clean JSON response for all thrown errors.

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong!";

  return res.status(statusCode).json({
    success: false,
    message: message,
  });
};
