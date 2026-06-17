// controllers/adminController/adminOrderController.js
// Basic admin order controller for handling order management

const Order = require("../../models/Order");
const AppError = require("../../utils/AppError");

// 🔹 Get All Orders (Admin)
// Path: GET /api/admin/orders
const getAllOrders = async (req, res) => {
  const orders = await Order.find({ isDeleted: false })
    .populate("userId", "username email name")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: orders.length,
    orders: orders,
  });
};

// 🔹 Update Order Status (Admin)
// Path: PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    throw new AppError("Please provide an order status", 400);
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: status },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    order: order,
  });
};

// 🔹 Delete Order (Soft Delete - Admin)
// Path: DELETE /api/admin/orders/:id
const deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true }
  );

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};
