// controllers/orderController.js
// Handles Placing new orders, retrieving order history, viewing order details, and updating status/items.
// Coordinates backend-driven stock validation, reduction on placement/payment, and cancellation restoration.

const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

// 🔹 Create a New Order
// Path: POST /api/orders
const createOrder = async (req, res) => {
  const { products, paymentMethod, address, phone, customerName, userEmail } = req.body;

  // 1. Validate fields
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new AppError("Products list is required and cannot be empty", 400);
  }

  // 2. Fetch products and calculate total price & items on the backend (prevents price tampering)
  let totalPrice = 0;
  let totalItems = 0;
  const preparedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const product = await Product.findById(item.productId);
    
    if (!product) {
      throw new AppError(`Product not found: ${item.name || item.productId}`, 404);
    }

    // Check stock availability
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name} (Available: ${product.stock})`, 400);
    }

    totalPrice += Number(product.price) * Number(item.quantity);
    totalItems += Number(item.quantity);

    preparedProducts.push({
      productId: product._id,
      name: product.name,
      price: Number(product.price),
      costPrice: Number(product.costPrice || 0),
      quantity: Number(item.quantity),
      status: "Placed",
      paymentStatus: "Pending"
    });
  }

  // 3. Generate a secure, unique order ID on the backend
  const orderId = "ORD_" + Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);

  const isOnline = paymentMethod === "ONLINE" || paymentMethod === "Online";

  // 4. Handle stock updates immediately for Cash on Delivery (COD)
  if (!isOnline) {
    for (let i = 0; i < preparedProducts.length; i++) {
      const item = preparedProducts[i];
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }
  }

  // 5. Create order in database
  const order = await Order.create({
    userId: req.user ? req.user.id : null,
    userEmail: userEmail || (req.user ? req.user.email : "") || "",
    customerName: customerName || (req.user ? req.user.name : "") || "",
    address: address || "",
    phone: phone || "",
    paymentMethod: isOnline ? "Online" : "Cash on Delivery",
    paymentStatus: "Pending",
    status: isOnline ? "Pending" : "Placed",
    stockUpdated: !isOnline,
    products: preparedProducts,
    totalPrice: totalPrice,
    totalAmount: totalPrice,
    totalItems: totalItems,
    orderId: orderId
  });

  return res.status(201).json({
    success: true,
    message: isOnline ? "Order initiated successfully. Complete payment." : "Order placed successfully",
    data: order
  });
};

// 🔹 Get All Orders
// Path: GET /api/orders
const getOrders = async (req, res) => {
  const { search, page, limit } = req.query;
  let filter = {};

  // Standard non-admin user can only see their own orders
  if (req.user.role !== "admin") {
    filter.$or = [
      { userId: req.user.id },
      { userEmail: req.user.email }
    ];
  }

  if (search) {
    const searchConditions = {
      $or: [
        { orderId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } }
      ]
    };
    
    if (req.user.role !== "admin") {
      filter = { $and: [filter, searchConditions] };
    } else {
      filter = searchConditions;
    }
  }

  const query = Order.find(filter)
    .populate("userId")
    .populate("products.productId")
    .sort({ createdAt: -1 });

  if (page || limit) {
    const currentPage = parseInt(page, 10) || 1;
    const itemsPerPage = parseInt(limit, 10) || 10;
    const skipAmount = (currentPage - 1) * itemsPerPage;

    const totalOrdersCount = await Order.countDocuments(filter);
    const ordersList = await query.skip(skipAmount).limit(itemsPerPage);

    return res.json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        count: ordersList.length,
        pagination: {
          total: totalOrdersCount,
          page: currentPage,
          limit: itemsPerPage,
          pages: Math.ceil(totalOrdersCount / itemsPerPage)
        },
        orders: ordersList
      }
    });
  }

  const ordersList = await query;
  return res.json({
    success: true,
    message: "Orders retrieved successfully",
    data: ordersList
  });
};

// 🔹 Get a Single Order by ID
// Path: GET /api/orders/:id
const getOrderById = async (req, res) => {
  const id = req.params.id;
  const isMongoId = mongoose.Types.ObjectId.isValid(id);
  
  let queryConditions = { orderId: id };
  if (isMongoId) {
    queryConditions = { $or: [{ _id: id }, { orderId: id }] };
  }

  const order = await Order.findOne(queryConditions)
    .populate("userId")
    .populate("products.productId");

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Access authorization check
  if (req.user.role !== "admin") {
    const isOwnerById = String(order.userId?._id || order.userId) === String(req.user.id);
    const isOwnerByEmail = order.userEmail === req.user.email;
    
    if (!isOwnerById && !isOwnerByEmail) {
      throw new AppError("Access Denied: You cannot view this order", 403);
    }
  }

  return res.json({
    success: true,
    message: "Order retrieved successfully",
    data: order
  });
};

// 🔹 Update Order Details (status, stock management)
// Path: PATCH /api/orders/:id or PUT /api/orders/:id
const updateOrder = async (req, res) => {
  const id = req.params.id;
  const isMongoId = mongoose.Types.ObjectId.isValid(id);

  let queryConditions = { orderId: id };
  if (isMongoId) {
    queryConditions = { $or: [{ _id: id }, { orderId: id }] };
  }

  const order = await Order.findOne(queryConditions);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Security check
  if (req.user.role !== "admin") {
    const isOwnerById = String(order.userId) === String(req.user.id);
    const isOwnerByEmail = order.userEmail === req.user.email;

    if (!isOwnerById && !isOwnerByEmail) {
      throw new AppError("Access Denied: You cannot modify this order", 403);
    }
  }

  // Restore stock if the order status is changing to "Cancelled" and stock was actually deducted
  const isChangingToCancelled = req.body.status === "Cancelled";
  const isCurrentlyCancelled = order.status === "Cancelled";

  if (isChangingToCancelled && !isCurrentlyCancelled && order.stockUpdated) {
    for (let i = 0; i < order.products.length; i++) {
      const item = order.products[i];
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }
    order.stockUpdated = false;
  }

  // Restore stock differences if quantities are updated and stock was actually deducted
  if (req.body.products && order.stockUpdated) {
    const newProductsList = req.body.products;

    for (let i = 0; i < order.products.length; i++) {
      const oldItem = order.products[i];
      let newItem = null;
      for (let j = 0; j < newProductsList.length; j++) {
        if (String(newProductsList[j].productId) === String(oldItem.productId)) {
          newItem = newProductsList[j];
          break;
        }
      }

      const oldQty = oldItem.quantity;
      const newQty = newItem ? newItem.quantity : 0;

      if (oldQty > newQty) {
        const diff = oldQty - newQty;
        await Product.findByIdAndUpdate(oldItem.productId, {
          $inc: { stock: diff }
        });
      }
    }
  }

  // Update fields
  const fieldsToUpdate = [
    "status",
    "products",
    "stockUpdated",
    "paymentStatus",
    "paymentMethod",
    "paymentId",
    "placedAt",
    "paidAt",
  ];

  for (let i = 0; i < fieldsToUpdate.length; i++) {
    const field = fieldsToUpdate[i];
    if (req.body[field] !== undefined) {
      order[field] = req.body[field];
    }
  }

  await order.save();
  
  return res.json({
    success: true,
    message: "Order updated successfully",
    data: order
  });
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
};