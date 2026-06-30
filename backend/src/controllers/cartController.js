


const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");


const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user.id;


  const parsedQuantity = Number(quantity);


  let cartItem = await Cart.findOne({ 
    userId: userId, 
    productId: productId 
  });

  if (cartItem) {
    
    cartItem.quantity = cartItem.quantity + parsedQuantity;
    await cartItem.save();
  } else {
   
    cartItem = await Cart.create({
      userId: userId,
      productId: productId,
      quantity: parsedQuantity,
    });
  }

  
  const populatedItem = await Cart.findById(cartItem._id).populate("productId");
  if (!populatedItem || !populatedItem.productId) {
    throw new AppError("Product not found", 404);
  }

  
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



const getCart = async (req, res) => {
  const userId = req.user.id;

  
  const cartItems = await Cart.find({ userId: userId }).populate("productId");

  
  const formattedCart = [];

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    
    
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



const updateCart = async (req, res) => {
  const productId = req.params.productId;
  const { quantity } = req.body;
  const userId = req.user.id;

  const parsedQuantity = Number(quantity);

  
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

  
  const cartItem = await Cart.findOneAndUpdate(
    { userId: userId, productId: productId },
    { quantity: parsedQuantity },
    { new: true } 
  ).populate("productId");

  
  if (!cartItem || !cartItem.productId) {
    throw new AppError("Cart item not found", 404);
  }

  
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



const removeCart = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user.id;

  
  await Cart.findOneAndDelete({ 
    userId: userId, 
    productId: productId 
  });

  return res.json({
    success: true,
    message: "Removed from cart",
  });
};



const clearCart = async (req, res) => {
  const userId = req.user.id;

  
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