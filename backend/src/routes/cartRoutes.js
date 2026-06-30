const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  addToCart,
  getCart,
  updateCart,
  removeCart,
  clearCart,
} = require("../controllers/cartController");


router.use(protect);

router.post("/", addToCart);
router.get("/", getCart);
router.put("/:productId", updateCart);
router.delete("/:productId", removeCart);
router.delete("/", clearCart);

module.exports = router;