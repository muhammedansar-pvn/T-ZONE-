const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// 🔹 Add product to user's wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Check if already in wishlist
    const exists = await Wishlist.findOne({ userId, productId });

    if (exists) {
      return res.status(200).json({
        success: true,
        message: "Product already in wishlist",
      });
    }

    const wishlistItem = await Wishlist.create({
      userId,
      productId,
    });

    const populated = await Wishlist.findById(wishlistItem._id).populate("productId");

    res.status(201).json({
      success: true,
      product: populated.productId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistItems = await Wishlist.find({ userId }).populate("productId");

    // Filter out items where the product was deleted
    const validItems = wishlistItems.filter(item => item.productId);
    const wishlist = validItems.map(item => item.productId);

    res.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Remove product from user's wishlist
const removeWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    await Wishlist.findOneAndDelete({ userId, productId });

    res.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeWishlist,
};