// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  try {
    // Support token from HttpOnly cookie (preferred) or Authorization header (fallback)
    const token = (req.cookies && req.cookies.token) || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload (missing user id)" });
    }

    // Attach the full user (without password) so downstream middleware/controllers
    // can read `req.user.role`, `req.user.isSeller`, etc. This fixes authorization
    // checks that were failing because only `id` was present.
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "User not found" });

    // Convert mongoose doc to plain object to avoid surprises
    req.user = user.toObject ? user.toObject() : user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};
