const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
} = require("../controllers/orderController");


router.use(protect);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id", updateOrder);
router.put("/:id", updateOrder);

module.exports = router;