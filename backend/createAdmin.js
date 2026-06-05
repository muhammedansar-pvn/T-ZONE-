const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
require("dotenv").config();
console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminExists = await User.findOne({
      email: "admin@gmail.com",
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    await User.create({
      username: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

createAdmin();