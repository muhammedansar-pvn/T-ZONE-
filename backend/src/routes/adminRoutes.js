const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// Import Admin Controllers
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/adminController/adminOrderController");

const {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminController/adminProductController");

const {
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
} = require("../controllers/adminController/adminUserController");

const {
  getDashboardStats,
} = require("../controllers/adminController/dashboardController");

// Apply authentication and admin authorization to all admin routes
router.use(protect);
router.use(authorize("admin"));

// 📊 Dashboard Routes
router.get("/dashboard/stats", getDashboardStats);

// 📦 Order Management Routes
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);

// 🏷️ Product Management Routes
router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// 👥 User Management Routes
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
