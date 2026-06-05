const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to normalize outgoing order
const normalizeOrderOutput = (order) => {
  if (!order) return null;
  const o = order.toJSON ? order.toJSON({ virtuals: true }) : order;
  if (o.orderId && !o.id) o.id = o.orderId;
  if (o.id && !o.orderId) o.orderId = o.id;
  if (o.totalAmount && !o.totalPrice) o.totalPrice = o.totalAmount;
  if (o.totalPrice && !o.totalAmount) o.totalAmount = o.totalPrice;
  return o;
};

// 🔹 Create Order
const createOrder = async (req, res) => {
  try {
    const orderData = { ...req.body };

    // Map frontend fields to backend schema
    if (orderData.id && !orderData.orderId) orderData.orderId = orderData.id;
    if (orderData.totalAmount && !orderData.totalPrice) orderData.totalPrice = orderData.totalAmount;
    if (orderData.totalPrice && !orderData.totalAmount) orderData.totalAmount = orderData.totalPrice;

    // Calculate totalItems if missing
    if (orderData.products && (!orderData.totalItems || orderData.totalItems === 0)) {
      orderData.totalItems = orderData.products.reduce((acc, item) => acc + (item.quantity || 1), 0);
    }

    // Resolve userId
    if (!orderData.userId) {
      if (req.user && req.user.id) {
        orderData.userId = req.user.id;
      } else if (orderData.userEmail) {
        const userObj = await User.findOne({ email: orderData.userEmail });
        if (userObj) {
          orderData.userId = userObj._id;
        }
      }
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      order: normalizeOrderOutput(order),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("products.productId");

    const normalizedOrders = orders.map(normalizeOrderOutput);

    res.json(normalizedOrders);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Get Order By ID (Supports _id or orderId)
const getOrderById = async (req, res) => {
  try {
    const idParam = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(idParam);

    let order = null;
    if (isObjectId) {
      order = await Order.findById(idParam)
        .populate("userId")
        .populate("products.productId");
    }

    if (!order) {
      order = await Order.findOne({ orderId: idParam })
        .populate("userId")
        .populate("products.productId");
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json(normalizeOrderOutput(order));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 Update Order (Supports status updates, product edits, cancellations)
const updateOrder = async (req, res) => {
  try {
    const idParam = req.params.id;
    const isObjectId = mongoose.Types.ObjectId.isValid(idParam);

    let order = null;
    if (isObjectId) {
      order = await Order.findById(idParam);
    }

    if (!order) {
      order = await Order.findOne({ orderId: idParam });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const { status, products, stockUpdated } = req.body;

    if (status !== undefined) order.status = status;
    if (products !== undefined) order.products = products;
    if (stockUpdated !== undefined) order.stockUpdated = stockUpdated;

    await order.save();

    res.json({
      success: true,
      order: normalizeOrderOutput(order),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
};