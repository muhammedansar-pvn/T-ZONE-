const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

router.post("/", async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
