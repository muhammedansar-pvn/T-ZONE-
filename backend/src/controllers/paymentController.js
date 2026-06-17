const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");

let razorpay = null;
const getRazorpayInstance = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new AppError("Razorpay API keys are not configured in environment variables (.env)", 500);
    }
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpay;
};

// Create Razorpay Order
// Path: POST /api/payments/create-order
const createPaymentOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new AppError("Order database ID is required", 400);
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(orderId);
  let queryConditions = { orderId: orderId };
  if (isMongoId) {
    queryConditions = { $or: [{ _id: orderId }, { orderId: orderId }] };
  }
  const order = await Order.findOne(queryConditions);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Initialize Razorpay securely
  const razorpayInstance = getRazorpayInstance();
  const options = {
    amount: Math.round(order.totalPrice * 100), // Razorpay expects amount in paise
    currency: "INR",
    receipt: String(order._id),
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  // Save Razorpay order ID to the order record (temporarily in paymentId field)
  order.paymentId = razorpayOrder.id;
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Razorpay order created successfully",
    data: {
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID // Send back key_id so the frontend knows what to initialize checkout with
    }
  });
};

// Verify Razorpay Payment
// Path: POST /api/payments/verify
const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    throw new AppError("All payment verification fields are required", 400);
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new AppError("Razorpay secret key is not configured", 500);
  }

  // Verify signature
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new AppError("Payment verification signature mismatch", 400);
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(orderId);
  let queryConditions = { orderId: orderId };
  if (isMongoId) {
    queryConditions = { $or: [{ _id: orderId }, { orderId: orderId }] };
  }
  const order = await Order.findOne(queryConditions);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Duplicate payment check to prevent double stock reduction
  if (order.paymentStatus === "Paid") {
    return res.status(200).json({
      success: true,
      message: "Payment already verified and updated",
      data: order
    });
  }

  // Validate stock one more time before final deduction
  for (let i = 0; i < order.products.length; i++) {
    const item = order.products[i];
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new AppError(`Product not found: ${item.name}`, 404);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name} (Available: ${product.stock})`, 400);
    }
  }

  // Deduct stock for all products
  for (let i = 0; i < order.products.length; i++) {
    const item = order.products[i];
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity }
    });
  }

  // Update order status, payment status, and paidAt
  order.paymentStatus = "Paid";
  order.status = "Paid";
  order.paymentId = razorpay_payment_id;
  order.paidAt = new Date();
  order.stockUpdated = true;
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Payment verified and order finalized successfully",
    data: order
  });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};