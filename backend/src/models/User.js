// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "seller", "customer"],
      default: "customer",
    },

    // Addresses for checkout
    addresses: [
      {
        type: {
          type: String,
          enum: ["HOME", "OFFICE"],
          default: "HOME",
        },
        address: { type: String, trim: true },
        city: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
    ],

    /* ================================
       NEW: Seller request workflow
       ================================ */

    sellerRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    sellerRequestedAt: {
      type: Date,
      default: null,
    },

    isSeller: {
      type: Boolean,
      default: false
    },

    sellerApprovedAt: {
      type: Date,
      default: null,
    },

    sellerApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
