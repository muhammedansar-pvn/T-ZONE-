// controllers/productController.js
// This controller handles fetching (with search, category, and pagination) and viewing details of products.

const Product = require("../models/Product");
const Review = require("../models/Review");
const AppError = require("../utils/AppError");

// 🔹 Get All Products (with optional pagination, search, and category filtering)
// Path: GET /api/products
const getProducts = async (req, res) => {
  const { category, search, page, limit } = req.query;

  // 1. Setup the default filter. We only want products that are not soft-deleted.
  const filter = { isDeleted: false };

  // 2. If a specific category is requested, filter by it
  if (category) {
    filter.category = category;
  }

  // 3. If a search query is provided, look for matches in name, description, brand, or category
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  // 4. Count the total number of products matching our filter (needed for pagination calculation)
  const totalProducts = await Product.countDocuments(filter);

  let products;
  let paginationInfo = null;

  // 5. If pagination parameters (page or limit) are defined
  if (page || limit) {
    // Convert query strings to integers, setting default fallbacks
    const currentPage = parseInt(page, 10) || 1;
    const itemsPerPage = parseInt(limit, 10) || 10;
    
    // Calculate how many products to skip from the beginning
    const skipAmount = (currentPage - 1) * itemsPerPage;

    // Fetch only the subset of products matching our filters
    products = await Product.find(filter)
      .skip(skipAmount)
      .limit(itemsPerPage);

    // Construct pagination details
    paginationInfo = {
      total: totalProducts,
      page: currentPage,
      limit: itemsPerPage,
      pages: Math.ceil(totalProducts / itemsPerPage),
    };
  } else {
    // If no pagination parameters, fetch all products matching the filters
    products = await Product.find(filter);
  }

  // Fetch review statistics for the returned products
  const productIds = products.map((p) => p._id);
  const ratings = await Review.aggregate([
    { $match: { productId: { $in: productIds } } },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        reviewsCount: { $sum: 1 },
      },
    },
  ]);

  const ratingsMap = {};
  ratings.forEach((r) => {
    ratingsMap[r._id.toString()] = {
      averageRating: Number(r.averageRating.toFixed(1)),
      reviewsCount: r.reviewsCount,
    };
  });

  const productsWithRatings = products.map((product) => {
    const ratingData = ratingsMap[product._id.toString()] || {
      averageRating: 0,
      reviewsCount: 0,
    };
    return {
      ...product.toObject(),
      averageRating: ratingData.averageRating,
      reviewsCount: ratingData.reviewsCount,
    };
  });

  // 6. Build the API response object
  const responseBody = {
    success: true,
    count: productsWithRatings.length,
    products: productsWithRatings,
  };

  // Include pagination information if it was computed
  if (paginationInfo) {
    responseBody.pagination = paginationInfo;
  }

  return res.json(responseBody);
};

// 🔹 Get Product By ID
// Path: GET /api/products/:id
const getProductById = async (req, res) => {
  const productId = req.params.id;
  
  // Find the product by its MongoDB ID
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Get review statistics
  const reviews = await Review.find({ productId });
  let averageRating = 0;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Number((sum / reviews.length).toFixed(1));
  }

  const productObj = {
    ...product.toObject(),
    averageRating,
    reviewsCount: reviews.length,
  };

  return res.json(productObj);
};

module.exports = {
  getProducts,
  getProductById,
};