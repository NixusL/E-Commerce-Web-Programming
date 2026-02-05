// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const stripe = process.env.STRIPE_SECRET_KEY ? require("stripe")(process.env.STRIPE_SECRET_KEY) : null;

// POST /api/orders/buy-now
// Customer buys a single product instantly - create Stripe checkout session
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
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [], // add image URLs if available
          },
          unit_amount: Math.round(product.price * 100), // in cents
        },
        quantity,
      },
    ];

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/products`,
      metadata: {
        type: "buy-now",
        productId,
        qty: quantity.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.json({ url: session.url });
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

    const allowed = ["pending", "processing", "paid", "shipped", "delivered", "completed", "cancelled", "refunded"];
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

// PUT /api/orders/:id/cancel
// Customer cancels their own order (only if still pending/processing)
async function cancelMyOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: "Order can’t be cancelled anymore" });
    }

    order.status = "cancelled";
    await order.save();

    res.json(order);
  } catch (err) {
    console.error("cancelMyOrder error:", err);
    res.status(400).json({ message: "Invalid order id" });
  }
}

// POST /api/orders/checkout
// Create Stripe checkout session from cart
async function createCheckoutSession(req, res) {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: [], // add image URLs if available
        },
        unit_amount: Math.round(item.product.price * 100), // in cents
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/orders/confirm-payment
// Confirm payment and create order
async function confirmPayment(req, res) {
  try {
    const { session_id } = req.body;

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const userId = session.metadata.userId;
    const type = session.metadata.type;

    let items = [];
    let total = session.amount_total / 100; // convert from cents

    if (type === "buy-now") {
      // Handle buy-now purchase
      const productId = session.metadata.productId;
      const qty = parseInt(session.metadata.qty);

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      // Check stock again
      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // Decrease stock
      product.stock -= qty;
      product.inStock = product.stock > 0;
      await product.save();

      items = [
        {
          product: product._id,
          name: product.name,
          price: product.price,
          qty,
          image: product.image || "",
        },
      ];
    } else {
      // Handle cart checkout
      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart not found or empty" });
      }

      // Check stock again
      for (const item of cart.items) {
        if (item.product.stock < item.qty) {
          return res.status(400).json({ message: `Insufficient stock for ${item.product.name}` });
        }
      }

      // Decrease stock
      for (const item of cart.items) {
        item.product.stock -= item.qty;
        item.product.inStock = item.product.stock > 0;
        await item.product.save();
      }

      items = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        image: item.product.image,
      }));

      // Clear cart
      await Cart.findOneAndDelete({ user: userId });
    }

    // Create order
    const order = await Order.create({
      customer: userId,
      items,
      total,
      status: "paid",
      paymentIntentId: session.payment_intent,
      paymentStatus: "paid",
      shippingAddress: req.body.shippingAddress || {},
    });

    res.json(order);
  } catch (err) {
    console.error("confirmPayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

// POST /api/orders/:id/refund
// Process refund
async function processRefund(req, res) {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "paid") {
      return res.status(400).json({ message: "Order not eligible for refund" });
    }

    // Process refund via Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
    });

    // Update order
    order.status = "refunded";
    order.paymentStatus = "refunded";
    await order.save();

    // Optionally, restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.qty;
        product.inStock = product.stock > 0;
        await product.save();
      }
    }

    res.json({ message: "Refund processed", refund });
  } catch (err) {
    console.error("processRefund error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  buyNow,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelMyOrder,
  createCheckoutSession,
  confirmPayment,
  processRefund,
};
