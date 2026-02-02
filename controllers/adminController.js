// controllers/adminController.js
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");

// GET /api/admin/products
async function adminListProducts(req, res) {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email role");

    res.json(products);
  } catch (e) {
    console.error("adminListProducts error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/admin/products/delete-many
// Body: { ids: ["..."] }
// Option A: reject deletion if ANY selected product has active orders (pending/processing)
async function adminDeleteProductsMany(req, res) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "ids[] is required" });
    }

    const active = await Order.findOne({
      status: { $in: ["pending", "processing"] },
      "items.product": { $in: ids },
    }).select("_id");

    if (active) {
      return res.status(409).json({
        message:
          "Cannot delete: there are active orders for one or more selected products. Mark out of stock instead.",
      });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) {
    console.error("adminDeleteProductsMany error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/admin/orders
async function adminListOrders(req, res) {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("customer", "name email role")
      .populate("items.product", "name");

    res.json(orders);
  } catch (e) {
    console.error("adminListOrders error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/admin/orders/:id/status
// Body: { status: "pending" | "processing" | "completed" | "cancelled" }
async function adminUpdateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "processing", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    const populated = await Order.findById(id)
      .populate("customer", "name email role")
      .populate("items.product", "name");

    res.json(populated);
  } catch (e) {
    console.error("adminUpdateOrderStatus error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/admin/orders/:id
async function adminDeleteOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    await Order.findByIdAndDelete(id);
    res.status(204).send();
  } catch (e) {
    console.error("adminDeleteOrder error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/admin/users/admin
// Body: { name, email, password }
async function adminCreateAdminUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "admin",
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    console.error("adminCreateAdminUser error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// GET /api/admin/categories
async function adminListCategories(req, res) {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (e) {
    console.error("adminListCategories error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/admin/categories
// Body: { name, description?, emoji? }
async function adminCreateCategory(req, res) {
  try {
    const { name, description, emoji } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({ name: name.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name: name.toLowerCase(),
      description: description || "",
      emoji: emoji || "📦",
    });

    res.status(201).json(category);
  } catch (e) {
    console.error("adminCreateCategory error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// PUT /api/admin/categories/:id
// Body: { name?, description?, emoji? }
async function adminUpdateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, emoji } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name && name !== category.name) {
      const exists = await Category.findOne({ name: name.toLowerCase() });
      if (exists) {
        return res.status(409).json({ message: "Category name already exists" });
      }
      category.name = name.toLowerCase();
    }

    if (description !== undefined) category.description = description;
    if (emoji !== undefined) category.emoji = emoji;

    await category.save();
    res.json(category);
  } catch (e) {
    console.error("adminUpdateCategory error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/admin/categories/:id
async function adminDeleteCategory(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const productsUsing = await Product.countDocuments({ category: category.name });
    if (productsUsing > 0) {
      return res.status(409).json({
        message: `Cannot delete: ${productsUsing} product(s) are using this category`,
      });
    }

    await Category.findByIdAndDelete(id);
    res.status(204).send();
  } catch (e) {
    console.error("adminDeleteCategory error:", e);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  adminListProducts,
  adminDeleteProductsMany,
  adminListOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminCreateAdminUser,
  adminListCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
};