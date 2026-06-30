


const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");



const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  
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
  
  
  const wishlistItem = await Wishlist.create({
    userId: userId,
    productId: productId,
  });

  
  const populatedItem = await Wishlist.findById(wishlistItem._id).populate("productId");
  if (!populatedItem || !populatedItem.productId) {
    throw new AppError("Product not found", 404);
  }

  return res.status(201).json({
    success: true,
    product: populatedItem.productId,
  });
};



const getWishlist = async (req, res) => {
  const userId = req.user.id;

  
  const wishlistItems = await Wishlist.find({ userId: userId }).populate("productId");

  
  const activeProductsList = [];

  for (let i = 0; i < wishlistItems.length; i++) {
    const item = wishlistItems[i];
    
    
    if (item.productId) {
      activeProductsList.push(item.productId);
    }
  }

  return res.json({
    success: true,
    wishlist: activeProductsList,
  });
};



const removeWishlist = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  
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