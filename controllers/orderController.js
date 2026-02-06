// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;

/* ======================================================
   BUY NOW / CHECKOUT (UNCHANGED)
====================================================== */

async function buyNow(req, res) {
  try {
    const { productId, qty } = req.body;
    const quantity = qty ? Number(qty) : 1;

    if (!productId) return res.status(400).json({ message: "productId is required" });
    if (!Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ message: "qty must be >= 1" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: product.name },
            unit_amount: Math.round(product.price * 100),
          },
          quantity,
        },
      ],
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
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

async function createCheckoutSession(req, res) {
  try {
    const { items } = req.body; // items = [{productId, qty}, ...]
    const userId = req.user._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "items array required" });
    }

    // Fetch all products and calculate totals
    const lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.qty,
      });

      totalAmount += product.price * item.qty;
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${clientUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/cart`,
      metadata: {
        type: "cart-checkout",
        userId: userId.toString(),
        itemsJson: JSON.stringify(items),
      },
    });

    res.json({ url: session.url, sessionId: session.id, total: totalAmount });
  } catch (err) {
    console.error("createCheckoutSession error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function confirmPayment(req, res) {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) return res.status(400).json({ message: "sessionId required" });

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Parse metadata
    const itemsJson = session.metadata.itemsJson;
    let items = [];
    if (itemsJson) {
      try {
        items = JSON.parse(itemsJson);
      } catch {
        items = [];
      }
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      total += product.price * item.qty;

      orderItems.push({
        product: product._id,
        qty: item.qty,
        price: product.price,
        name: product.name,
        image: product.image,
      });

      // Reduce stock
      product.stock -= item.qty;
      product.inStock = product.stock > 0;
      await product.save();
    }

    // Create order
    const order = new Order({
      customer: userId,
      items: orderItems,
      total,
      status: "paid",
      paymentStatus: "paid",
      paymentIntentId: session.payment_intent,
      sessionId: session.id,
      refundStatus: "none",
      refundRequested: false,
    });

    await order.save();

    // Clear cart
    await Cart.deleteOne({ user: userId });

    res.json({ message: "Payment confirmed", order, orderId: order._id });
  } catch (err) {
    console.error("confirmPayment error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate("customer", "name email role")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["pending", "processing", "paid", "shipped", "delivered", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch {
    res.status(400).json({ message: "Invalid request" });
  }
}

async function deleteOrder(req, res) {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch {
    res.status(400).json({ message: "Invalid order id" });
  }
}

async function cancelMyOrder(req, res) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["pending", "processing"].includes(order.status)) {
      return res.status(400).json({ message: "Order can't be cancelled" });
    }

    order.status = "cancelled";
    await order.save();
    res.json(order);
  } catch {
    res.status(400).json({ message: "Invalid request" });
  }
}

/* ======================================================
   REFUND FLOW (NEW)
====================================================== */

// STEP 1 — Customer requests refund
async function requestRefund(req, res) {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["completed", "paid"].includes(order.status)) {
      return res.status(400).json({ message: "Refund not allowed for this order status" });
    }
    if (order.refundStatus !== "none") {
      return res.status(400).json({ message: "Refund already requested or processed" });
    }

    order.refundStatus = "pending";
    order.refundRequested = true;
    await order.save();

    res.json({ message: "Refund request submitted", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// STEP 2 — Seller/Admin approves refund
async function sellerApproveRefund(req, res) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.refundStatus !== "pending") {
      return res.status(400).json({ message: "Refund not pending" });
    }

    // Check authorization: seller must own at least one product in order
    if (req.user.role !== "admin") {
      const ownsProduct = order.items.some(
        (i) => i.product?.createdBy?.toString() === req.user._id.toString()
      );

      if (!ownsProduct) {
        return res.status(403).json({ message: "Not authorized to approve this refund" });
      }
    }

    order.refundStatus = "approved";
    await order.save();

    res.json({ message: "Refund approved", order });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// STEP 3 — Admin processes refund (Stripe)
async function processRefund(req, res) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.refundStatus !== "approved") {
      return res.status(400).json({ message: "Refund not approved" });
    }

    if (!order.paymentIntentId) {
      return res.status(400).json({ message: "No payment intent found" });
    }

    // Process refund with Stripe
    if (stripe) {
      await stripe.refunds.create({
        payment_intent: order.paymentIntentId,
      });
    }

    order.status = "refunded";
    order.paymentStatus = "refunded";
    order.refundStatus = "refunded";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.qty;
        product.inStock = product.stock > 0;
        await product.save();
      }
    }

    res.json({ message: "Refund processed successfully", order });
  } catch (err) {
    console.error("processRefund error:", err);
    res.status(500).json({ message: "Refund processing failed" });
  }
}

// SELLER: list pending refund requests for this seller
async function getSellerPendingRefunds(req, res) {
  try {
    const orders = await Order.find({ refundStatus: "pending" })
      .populate("customer", "name email")
      .populate("items.product");

    const sellerId = req.user._id.toString();

    const mine = orders.filter((o) =>
      (o.items || []).some(
        (it) => it.product?.createdBy?.toString() === sellerId
      )
    );

    res.json(mine);
  } catch (err) {
    console.error("getSellerPendingRefunds error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  buyNow,
  createCheckoutSession,
  confirmPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  cancelMyOrder,
  requestRefund,
  getSellerPendingRefunds,
  sellerApproveRefund,
  processRefund,
};