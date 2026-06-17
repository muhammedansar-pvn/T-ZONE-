// middleware/asyncHandler.js
// Utility to wrap async route handlers to automatically pass errors to next() without try-catch blocks.

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
