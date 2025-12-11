// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");

// POST /api/orders/buy-now
// Customer buys a single product instantly
async function buyNow(req, res) {
  try {
    const { productId, qty } = req.body;
    const quantity = qty ? Number(qty) : 1;

    if (!productId) return res.status(400).json({ message: "productId is required" });
    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ message: "qty must be a number >= 1" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const total = product.price * quantity;

    const order = await Order.create({
      customer: req.user._id,
      items: [
        {
          product: product._id,
          name: product.name,
          price: product.price,
          qty: quantity,
        },
      ],
      total,
      status: "pending",
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("buyNow error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/orders/my
async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/orders (admin only)
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate("customer", "name email role")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/orders/:id/status (admin only)
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "processing", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(400).json({ message: "Invalid order id or data" });
  }
}

// DELETE /api/orders/:id (admin only)
async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.status(204).send();
  } catch (err) {
    console.error("deleteOrder error:", err);
    res.status(400).json({ message: "Invalid order id" });
  }
}

module.exports = {
  buyNow,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
};