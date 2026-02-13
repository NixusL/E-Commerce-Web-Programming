const Coupon = require("../models/Coupon");
const User = require("../models/User");

// Admin: Create a coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, name, discount } = req.body;

    // Validate inputs
    if (!code || !name || discount === undefined) {
      return res.status(400).json({ message: "code, name, and discount are required" });
    }

    if (discount < 5 || discount > 30) {
      return res.status(400).json({ message: "Discount must be between 5 and 30" });
    }

    // Check if coupon code already exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const userId = req.user?.id || req.user?._id || req.user?.userId || null;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      discount,
      createdBy: userId,
      usedBy: [],
      isActive: true,
    });

    await coupon.save();

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({ message: error.message || "Failed to create coupon" });
  }
};

// User: Activate a coupon (add self to usedBy)
exports.activateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "code is required" });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is no longer active" });
    }

    // Check if user already used this coupon
    const userId = req.user?.id || req.user?._id || req.user?.userId || null;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    if (coupon.claimedBy.map(String).includes(String(userId))) {
      return res.status(400).json({ message: "You have already activated this coupon" });
    }

    // Add user to claimedBy array (activation)
    coupon.claimedBy.push(userId);
    await coupon.save();

    res.json({
      message: "Coupon activated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Activate coupon error:", error);
    res.status(500).json({ message: error.message || "Failed to activate coupon" });
  }
};

// User: Get my activated coupons
exports.getMyCoupons = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId || null;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const coupons = await Coupon.find({ claimedBy: userId, isActive: true });

    res.json(coupons);
  } catch (error) {
    console.error("Get my coupons error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch coupons" });
  }
};

// Admin: Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("createdBy", "email").populate("usedBy", "email");

    res.json(coupons);
  } catch (error) {
    console.error("Get all coupons error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch coupons" });
  }
};

// Admin: Deactivate a coupon
exports.deactivateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({
      message: "Coupon deactivated",
      coupon,
    });
  } catch (error) {
    console.error("Deactivate coupon error:", error);
    res.status(500).json({ message: error.message || "Failed to deactivate coupon" });
  }
};
