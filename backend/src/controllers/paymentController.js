const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../models/Order");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createPaymentOrder = async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new AppError("Order ID is required", 400);
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(orderId);
  const queryConditions = isMongoId
    ? { $or: [{ _id: orderId }, { orderId }] }
    : { orderId };

  const order = await Order.findOne(queryConditions);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: order.totalPrice * 100, 
    currency: "INR",
    receipt: order._id.toString(),
  });

  res.status(200).json({
    success: true,
    message: "Razorpay order created successfully",
    data: {
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    },
  });
};


const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !orderId
  ) {
    throw new AppError("All fields are required", 400);
  }

  
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new AppError("Payment verification failed", 400);
  }

  const isMongoId = mongoose.Types.ObjectId.isValid(orderId);
  const queryConditions = isMongoId
    ? { $or: [{ _id: orderId }, { orderId }] }
    : { orderId };

  const order = await Order.findOne(queryConditions);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  
  for (const item of order.products) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  order.paymentStatus = "Paid";
  order.status = "Paid";
  order.paymentId = razorpay_payment_id;
  order.paidAt = new Date();

  await order.save();

  res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    data: order,
  });
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
};