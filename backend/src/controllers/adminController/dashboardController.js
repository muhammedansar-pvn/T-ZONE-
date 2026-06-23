

const Order = require("../../models/Order");
const Product = require("../../models/Product");
const User = require("../../models/User");


const getDashboardStats = async (req, res) => {
  
  const [totalOrders, totalProducts, totalUsers] = await Promise.all([
    Order.countDocuments({ isDeleted: false }),
    Product.countDocuments({ isDeleted: false }),
    User.countDocuments({ isDeleted: false, role: "user" }),
  ]);


  const orders = await Order.find({ isDeleted: false, status: { $ne: "Cancelled" } });
  const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || order.totalAmount || 0), 0);

  
  const recentOrders = await Order.find({ isDeleted: false })
    .populate("userId", "username email")
    .sort({ createdAt: -1 })
    .limit(5);

  return res.status(200).json({
    success: true,
    data: {
      stats: {
        totalSales,
        totalOrders,
        totalProducts,
        totalUsers,
      },
      recentOrders,
    },
  });
};

module.exports = {
  getDashboardStats,
};
