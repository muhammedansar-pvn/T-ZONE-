// src/config/seedAdmin.js
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL 
    const adminPassword = process.env.ADMIN_PASSWORD


    const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });

    if (adminExists) {
      console.log("Admin seeding: Default admin user already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.create({
      username: "Admin",
      name: "Admin User",
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isVerified: true, 
    });

    console.log(`Admin seeding: Admin user successfully created with email: ${adminEmail}`);
  } catch (error) {
    console.error("Admin seeding error:", error.message);
  }
};

module.exports = seedAdmin;
