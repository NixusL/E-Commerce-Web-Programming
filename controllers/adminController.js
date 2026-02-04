// controllers/adminController.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /api/admin/products
async function adminListProducts(req, res) {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/admin/products/delete-many
async function adminDeleteProductsMany(req, res) {
  try {
    const { ids } = req.body; // array of product ids
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid product IDs' });
    }
    // Check for active orders
    const hasActiveOrders = await Order.exists({
      'items.product': { $in: ids },
      status: { $in: ['pending', 'processing'] }
    });
    if (hasActiveOrders) {
      return res.status(409).json({ message: 'Cannot delete: some products have active orders' });
    }
    await Product.deleteMany({ _id: { $in: ids } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting products:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/admin/orders
async function adminListOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// PUT /api/admin/orders/:id/status
async function adminUpdateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('customer', 'name email')
      .populate('items.product', 'name');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/admin/orders/:id
async function adminDeleteOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/admin/users/admin
async function adminCreateAdminUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash,
      role: 'admin'
    });
    const savedUser = await user.save();
    res.status(201).json({ id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/admin/users/seller
async function adminCreateSellerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash,
      role: 'seller'
    });
    const savedUser = await user.save();
    res.status(201).json({ id: savedUser._id, name: savedUser.name, email: savedUser.email, role: savedUser.role });
  } catch (error) {
    console.error('Error creating seller user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// GET /api/admin/categories
async function adminListCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// POST /api/admin/categories
async function adminCreateCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = new Category({ name: name.trim() });
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /api/admin/categories/:id
async function adminDeleteCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    // Check if category is used by products
    const productsUsingCategory = await Product.countDocuments({ category: id });
    if (productsUsingCategory > 0) {
      return res.status(409).json({ message: 'Cannot delete category: it is used by products' });
    }
    await Category.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  adminListProducts,
  adminDeleteProductsMany,
  adminListOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminCreateAdminUser,
  adminCreateSellerUser,
  adminListCategories,
  adminCreateCategory,
  adminDeleteCategory
};
