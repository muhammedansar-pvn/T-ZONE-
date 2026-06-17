// controllers/wishlistController.js
// This controller handles all operations on the user's wishlist: Adding, viewing, and removing items.

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

// 🔹 Add product to user's wishlist
// Path: POST /api/wishlist
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  // 1. Check if the product is already in the user's wishlist
  const existingItem = await Wishlist.findOne({ 
    userId: userId, 
    productId: productId 
  });

  if (existingItem) {
    return res.status(200).json({
      success: true,
      message: "Product already in wishlist",
    });
  }
  
  // 2. Add the product to the wishlist
  const wishlistItem = await Wishlist.create({
    userId: userId,
    productId: productId,
  });

  // 3. Populate product details to return to frontend
  const populatedItem = await Wishlist.findById(wishlistItem._id).populate("productId");
  if (!populatedItem || !populatedItem.productId) {
    throw new AppError("Product not found", 404);
  }

  return res.status(201).json({
    success: true,
    product: populatedItem.productId,
  });
};

// 🔹 Get user's wishlist items
// Path: GET /api/wishlist
const getWishlist = async (req, res) => {
  const userId = req.user.id;

  // 1. Find all wishlist records for the user and load the product details
  const wishlistItems = await Wishlist.find({ userId: userId }).populate("productId");

  // 2. Loop through the items and extract only the active products (skipping deleted ones)
  const activeProductsList = [];

  for (let i = 0; i < wishlistItems.length; i++) {
    const item = wishlistItems[i];
    
    // If the product exists (was not deleted), add it to the list
    if (item.productId) {
      activeProductsList.push(item.productId);
    }
  }

  return res.json({
    success: true,
    wishlist: activeProductsList,
  });
};

// 🔹 Remove product from user's wishlist
// Path: DELETE /api/wishlist/:productId
const removeWishlist = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  // Delete the wishlist item matching the user and product IDs
  await Wishlist.findOneAndDelete({ 
    userId: userId, 
    productId: productId 
  });

  return res.json({
    success: true,
    message: "Removed from wishlist",
  });
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeWishlist,
};