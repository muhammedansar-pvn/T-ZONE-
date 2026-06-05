const Cart = require("../models/Cart");
const Product = require("../models/Product");



// 🔹 Add product to user's cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Check if item already in cart
    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      // If already in cart, increment quantity
      cartItem.quantity += Number(quantity);
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await Cart.create({
        userId,
        productId,
        quantity: Number(quantity),
      });
    }

    const populated = await Cart.findById(cartItem._id).populate("productId");

    res.status(201).json({
      success: true,
      cartItem: {
        ...populated.productId.toJSON(),
        quantity: populated.quantity,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.find({ userId }).populate("productId");

    // Filter out items where the product was deleted
    const validItems = cartItems.filter(item => item.productId);
    const normalized = validItems.map(item => ({
      ...item.productId.toJSON(),
      quantity: item.quantity,
    }));

    res.json({
      success: true,
      cart: normalized,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Update quantity of product in user's cart
const updateCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (Number(quantity) <= 0) {
      await Cart.findOneAndDelete({ userId, productId });
      return res.json({
        success: true,
        message: "Item removed from cart",
      });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId, productId },
      { quantity: Number(quantity) },
      { returnDocument: "after"}
    ).populate("productId");

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    res.json({
      success: true,
      cartItem: {
        ...cartItem.productId.toJSON(),
        quantity: cartItem.quantity,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Remove product from user's cart
const removeCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    await Cart.findOneAndDelete({ userId, productId });

    res.json({
      success: true,
      message: "Removed from cart",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Clear user's cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.deleteMany({ userId });

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  removeCart,
  clearCart,
};