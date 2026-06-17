// controllers/adminController/adminProductController.js
// Basic admin product controller for handling product inventory

const Product = require("../../models/Product");
const AppError = require("../../utils/AppError");

// 🔹 Get All Products (Admin - returns additional fields like costPrice)
// Path: GET /api/admin/products
const getAdminProducts = async (req, res) => {
  const products = await Product.find({ isDeleted: false }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: products.length,
    products: products,
  });
};

// 🔹 Create Product (Admin)
// Path: POST /api/admin/products
const createProduct = async (req, res) => {
  const { name, description, price, costPrice, stock, category, brand, images } = req.body;

  if (!name || !description || !price || !category) {
    throw new AppError("Please provide all required fields (name, description, price, category)", 400);
  }

  const product = await Product.create({
    name,
    description,
    price,
    costPrice: costPrice || 0,
    stock: stock || 0,
    category,
    brand: brand || "",
    images: images || [],
  });

  return res.status(201).json({
    success: true,
    product: product,
  });
};

// 🔹 Update Product (Admin)
// Path: PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    product: product,
  });
};

// 🔹 Delete Product (Soft Delete - Admin)
// Path: DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};

module.exports = {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
