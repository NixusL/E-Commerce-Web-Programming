// Simple script to promote a user to admin
// Usage: node makeAdmin.js <email>

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function makeAdmin(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`User with email "${email}" not found`);
      process.exit(1);
    }

    const previousRole = user.role;
    user.role = "admin";
    await user.save();

    console.log(`✓ User "${user.name}" promoted to admin (was: ${previousRole})`);
    console.log(`  Email: ${user.email}`);
    console.log(`  ID: ${user._id}`);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: node makeAdmin.js <email>");
  console.log("Example: node makeAdmin.js user@example.com");
  process.exit(1);
}

makeAdmin(email);
