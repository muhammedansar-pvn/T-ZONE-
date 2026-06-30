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
      type: Number,
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

    paidAt: {
      type: Date,
      default: null,
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
    id: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.orderId || ret.id;
        ret.totalPrice = ret.totalAmount = ret.totalPrice || ret.totalAmount || 0;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret.orderId || ret.id;
        ret.totalPrice = ret.totalAmount = ret.totalPrice || ret.totalAmount || 0;
        return ret;
      }
    }
  }
);


orderSchema.virtual("id")
  .get(function() {
    return this.orderId;
  })
  .set(function(val) {
    this.orderId = val;
  });


orderSchema.pre("validate", function() {
  if (this.products && (!this.totalItems || this.totalItems === 0)) {
    this.totalItems = this.products.reduce((acc, p) => acc + (p.quantity || 1), 0);
  }
  const price = this.totalPrice || this.totalAmount || 0;
  this.totalPrice = price;
  this.totalAmount = price;
});

orderSchema.index({ userId: 1 });
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ isDeleted: 1 });

module.exports = mongoose.model("Order", orderSchema);