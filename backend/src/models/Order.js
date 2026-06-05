const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userEmail: {
      type: String,
      default: "",
    },

    customerName: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    paymentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      default: "Placed",
    },

    stockUpdated: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          default: "",
        },

        price: {
          type: Number,
          default: 0,
        },

        costPrice: {
          type: Number,
          default: 0,
        },

        quantity: {
          type: Number,
          default: 1,
        },

        status: {
          type: String,
          default: "Placed",
        },

        paymentStatus: {
          type: String,
          default: "Pending",
        },
      },
    ],

    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    orderId: {
      type: String,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    totalItems: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model("Order", orderSchema);