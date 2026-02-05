// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// POST /api/cart/add
// Add item to cart
async function addToCart(req, res) {
  try {
    const { productId, qty } = req.body;
    const quantity = qty ? Number(qty) : 1;

    if (!productId) return res.status(400).json({ message: "productId is required" });
    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ message: "qty must be a number >= 1" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      existingItem.qty += quantity;
    } else {
      cart.items.push({ product: productId, qty: quantity });
    }

    await cart.save();
    await cart.populate("items.product");

    res.json(cart);
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/cart/remove/:productId
// Remove item from cart
async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    await cart.populate("items.product");

    // Filter out items with deleted products
    cart.items = cart.items.filter(item => item.product !== null);
    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/cart
// Get user's cart
async function getCart(req, res) {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) {
      return res.json({ items: [] });
    }
    // Filter out items with deleted products
    cart.items = cart.items.filter(item => item.product !== null);
    // Save the cleaned cart
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/cart/clear
// Clear cart
async function clearCart(req, res) {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("clearCart error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  addToCart,
  removeFromCart,
  getCart,
  clearCart,
};
