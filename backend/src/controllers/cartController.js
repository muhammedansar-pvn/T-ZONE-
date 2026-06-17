// controllers/cartController.js
// This controller handles all operations on the shopping cart: Adding, viewing, updating quantity, and removing items.

const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

// 🔹 Add a product to the user's cart
// Path: POST /api/cart
const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.id;

  // 1. Convert quantity to number to be safe
  const parsedQuantity = Number(quantity);

  // 2. Check if this product is already in the user's cart
  let cartItem = await Cart.findOne({ 
    userId: userId, 
    productId: productId 
  });

  if (cartItem) {
    // If the product is already in the cart, increase its quantity
    cartItem.quantity = cartItem.quantity + parsedQuantity;
    await cartItem.save();
  } else {
    // If it's a new product, create a new cart item record
    cartItem = await Cart.create({
      userId: userId,
      productId: productId,
      quantity: parsedQuantity,
    });
  }

  // 3. Retrieve the updated cart item and populate the product details
  const populatedItem = await Cart.findById(cartItem._id).populate("productId");
  if (!populatedItem || !populatedItem.productId) {
    throw new AppError("Product not found", 404);
  }

  // 4. Return the formatted cart item
  return res.status(201).json({
    success: true,
    cartItem: {
      _id: populatedItem.productId._id,
      id: populatedItem.productId._id,
      name: populatedItem.productId.name,
      price: populatedItem.productId.price,
      description: populatedItem.productId.description,
      images: populatedItem.productId.images,
      stock: populatedItem.productId.stock,
      brand: populatedItem.productId.brand,
      category: populatedItem.productId.category,
      quantity: populatedItem.quantity,
    },
  });
};

// 🔹 Retrieve all items in the user's cart
// Path: GET /api/cart
const getCart = async (req, res) => {
  const userId = req.user.id;

  // 1. Fetch all cart items belonging to the user and load the product details
  const cartItems = await Cart.find({ userId: userId }).populate("productId");

  // 2. Format the database items into a cleaner structure for the frontend
  const formattedCart = [];

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    
    // Only include this item if the product exists (was not deleted)
    if (item.productId) {
      const product = item.productId;

      formattedCart.push({
        _id: product._id,
        id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        images: product.images,
        stock: product.stock,
        brand: product.brand,
        category: product.category,
        quantity: item.quantity,
      });
    }
  }

  return res.json({
    success: true,
    cart: formattedCart,
  });
};

// 🔹 Update the quantity of a product in the user's cart
// Path: PUT /api/cart/:productId
const updateCart = async (req, res) => {
  const productId = req.params.productId;
  const { quantity } = req.body;
  const userId = req.user.id;

  const parsedQuantity = Number(quantity);

  // 1. If the requested quantity is 0 or less, remove the product from the cart
  if (parsedQuantity <= 0) {
    await Cart.findOneAndDelete({ 
      userId: userId, 
      productId: productId 
    });
    
    return res.json({
      success: true,
      message: "Item removed from cart",
    });
  }

  // 2. Find and update the quantity of the cart item
  const cartItem = await Cart.findOneAndUpdate(
    { userId: userId, productId: productId },
    { quantity: parsedQuantity },
    { new: true } // Return the updated document
  ).populate("productId");

  // 3. If the item doesn't exist in the cart, return 404
  if (!cartItem || !cartItem.productId) {
    throw new AppError("Cart item not found", 404);
  }

  // 4. Return the formatted item
  return res.json({
    success: true,
    cartItem: {
      _id: cartItem.productId._id,
      id: cartItem.productId._id,
      name: cartItem.productId.name,
      price: cartItem.productId.price,
      description: cartItem.productId.description,
      images: cartItem.productId.images,
      stock: cartItem.productId.stock,
      brand: cartItem.productId.brand,
      category: cartItem.productId.category,
      quantity: cartItem.quantity,
    },
  });
};

// 🔹 Remove a product from the user's cart completely
// Path: DELETE /api/cart/:productId
const removeCart = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  // Delete the cart item record matching the user and product IDs
  await Cart.findOneAndDelete({ 
    userId: userId, 
    productId: productId 
  });

  return res.json({
    success: true,
    message: "Removed from cart",
  });
};

// 🔹 Clear all items from the user's cart (used after checkout)
// Path: DELETE /api/cart
const clearCart = async (req, res) => {
  const userId = req.user.id;

  // Delete all cart records belonging to this user
  await Cart.deleteMany({ userId: userId });

  return res.json({
    success: true,
    message: "Cart cleared successfully",
  });
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeCart,
  clearCart,
};