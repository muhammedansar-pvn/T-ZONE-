const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getProducts,
  getProductById,
} = require("../controllers/productController");

const {
  addProductReview,
  getProductReviews,
} = require("../controllers/reviewController");


router.get("/", getProducts);

router.get("/:id", getProductById);
router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", protect, addProductReview);

module.exports = router;