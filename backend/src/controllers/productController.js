


const Product = require("../models/Product");
const Review = require("../models/Review");
const AppError = require("../utils/AppError");


const getProducts = async (req, res) => {
  const { category, search } = req.query;

  const filter = { isDeleted: false };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const totalProducts = await Product.countDocuments(filter);

  let products;
  let currentPage = 1;
  let itemsPerPage = totalProducts || 8;
  let totalPages = 1;

  if (req.query.page || req.query.limit) {
    currentPage = Number(req.query.page) || 1;
    itemsPerPage = Number(req.query.limit) || 8;
    const skip = (currentPage - 1) * itemsPerPage;
    products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(itemsPerPage);
    totalPages = Math.ceil(totalProducts / itemsPerPage);
  } else {
    products = await Product.find(filter).sort({ createdAt: -1 });
  }

  res.json({
    success: true,
    count: products.length,
    totalProducts,
    currentPage,
    totalPages,
    products,
  });
};


const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
  throw new AppError("Product not found", 404);
}

  const reviews = await Review.find({ productId: req.params.id });

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  const averageRating =
    reviews.length > 0 ? (total / reviews.length).toFixed(1) : 0;

  res.json({
    ...product.toObject(),
    averageRating,
    reviewsCount: reviews.length,
  });
};

module.exports = {
  getProducts,
  getProductById,
};