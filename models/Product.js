// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      default: 'Uncategorized',
    },
    description: {
      type: String,
      default: '',
    },
    emoji: {
      type: String,
      default: '🛒',
    },
    inStock: {
      type: Boolean,
      default: true,
    },

    //who created/sells this product
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;