const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const {
  getProducts,
  getProductById,
} = require("../controllers/productController");

const {
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/adminController/adminProductController");


router.post("/", protect, authorize("admin"), createProduct);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.put("/:id", protect, authorize("admin"), updateProduct);
router.patch("/:id", protect, authorize("admin"), updateProduct);

router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;