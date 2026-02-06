// controllers/userController.js
const User = require("../models/User");
const SellerRequest = require("../models/SellerRequest");

function getUserId(req) {
    if (!req.user) return null;
    return req.user.id || req.user._id || req.user.userId || null;
}

// POST /api/users/request-seller
exports.requestSellerUpgrade = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.isSeller || user.role === "seller" || user.role === "admin") {
            return res.json({
                hasRequest: true,
                status: "approved",
                isSeller: true,
                message: "Already a seller",
            });
        }

        // If already requested, keep it pending (don’t overwrite)
        if (user.sellerRequestStatus === "pending") {
            return res.json({
                hasRequest: true,
                status: "pending",
                isSeller: false,
                message: "Seller request already pending",
            });
        }

        user.sellerRequestStatus = "pending";
        user.sellerRequestedAt = new Date();
        await user.save();

        // Create a SellerRequest document for admin review if one doesn't exist
        try {
            const existing = await SellerRequest.findOne({ user: user._id });
            if (!existing) {
                const created = await SellerRequest.create({ user: user._id, status: "pending" });
                console.log('SellerRequest created for user', user._id.toString(), created._id.toString());
            } else if (existing.status !== "pending") {
                // If there is an existing non-pending request, keep it in sync
                existing.status = "pending";
                existing.reviewedAt = null;
                existing.reviewedBy = null;
                await existing.save();
            }
        } catch (e) {
            console.error("Failed to create SellerRequest document:", e);
            // Non-fatal: continue, user record is the source of truth for user-facing status
        }

        return res.json({
            hasRequest: true,
            status: "pending",
            isSeller: false,
            message: "Seller request submitted",
        });
    } catch (err) {
        console.error("requestSellerUpgrade error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/users/become-seller (alias)
exports.becomeSeller = async (req, res) => {
    return exports.requestSellerUpgrade(req, res);
};

// GET /api/users/seller-request/status
exports.getSellerRequestStatus = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: "Not authorized" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const status = user.sellerRequestStatus || "none";
        const isSeller = !!user.isSeller || user.role === "seller" || user.role === "admin";

        return res.json({
            hasRequest: status !== "none",
            status: isSeller ? "approved" : status,
            isSeller,
        });
    } catch (err) {
        console.error("getSellerRequestStatus error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
