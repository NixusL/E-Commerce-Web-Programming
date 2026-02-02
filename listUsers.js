// List all users in the database
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    const users = await User.find().select("name email role createdAt");
    
    if (users.length === 0) {
      console.log("No users found in database");
      process.exit(0);
    }

    console.log("Users in database:");
    console.log("==================\n");
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}\n`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

listUsers();
