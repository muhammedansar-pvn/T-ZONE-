const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

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
} = require("../controllers/adminController/adminUserController");

const {
  getDashboardStats,
} = require("../controllers/adminController/dashboardController");


router.use(protect);
router.use(authorize("admin"));


router.get("/dashboard/stats", getDashboardStats);


router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.delete("/orders/:id", deleteOrder);


router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);


router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/block", toggleBlockUser);

module.exports = router;
