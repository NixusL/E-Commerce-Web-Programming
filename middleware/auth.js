// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ ensure req.user has an id field
    // decoded might be { id: ... } or { userId: ... } depending how you sign JWT
    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload (missing user id)" });
    }

    // Option 1: attach minimal object (works with your controller)
    req.user = { id: userId };

    // Option 2 (optional): attach full user
    // req.user = await User.findById(userId).select("-passwordHash");

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Token is not valid" });
  }
};
