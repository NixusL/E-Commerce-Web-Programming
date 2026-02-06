// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        qty: { type: Number, default: 1, min: 1 },
        image: { type: String, default: "" },
      },
    ],

    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "paid",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    paymentIntentId: { type: String },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    /* ===============================
       REFUND FLOW STATE (NEW)
    =============================== */

    refundRequested: {
      type: Boolean,
      default: false,
    },

    refundStatus: {
      type: String,
      // align with controller values: 'pending' (customer requested), 'approved' (seller/admin approved), 'refunded', 'rejected'
      enum: ["none", "pending", "approved", "refunded", "rejected"],
      default: "none",
    },

    shippingAddress: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: "USA" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
