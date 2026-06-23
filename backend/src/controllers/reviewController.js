const Review = require("../models/Review");
const User = require("../models/User");
const AppError = require("../utils/AppError");


// Path: POST /api/products/:id/reviews
const addProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user.id;

  if (!rating || !comment) {
    throw new AppError("Rating and comment are required", 400);
  }

  const dbUser = await User.findById(userId);
  if (!dbUser) {
    throw new AppError("User not found", 404);
  }
  const name = dbUser.name || dbUser.username || "Anonymous";

  // 1. Check if the user already reviewed this product
  let review = await Review.findOne({ productId, userId });

  if (review) {
    // Update existing review
    review.rating = Number(rating);
    review.comment = comment;
    await review.save();
  } else {
    // Create new review
    review = await Review.create({
      productId,
      userId,
      name,
      rating: Number(rating),
      comment,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Review submitted successfully",
    review,
  });
};

// 🔹 Get All Reviews for a Product (calculates average rating)
// Path: GET /api/products/:id/reviews
const getProductReviews = async (req, res) => {
  const productId = req.params.id;
  const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

  // Calculate average rating
  let averageRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = (sum / reviews.length).toFixed(1);
  }

  return res.status(200).json({
    success: true,
    count: reviews.length,
    averageRating: Number(averageRating),
    reviews,
  });
};

module.exports = {
  addProductReview,
  getProductReviews,
};
