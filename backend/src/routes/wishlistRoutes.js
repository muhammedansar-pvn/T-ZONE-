const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  addToWishlist,
  getWishlist,
  removeWishlist,
} = require("../controllers/wishlistController");

// Protect all wishlist routes
router.use(protect);

router.post("/", addToWishlist);
router.get("/", getWishlist);
router.delete("/:productId", removeWishlist);

module.exports = router;