// config/db.js
// This file handles the connection to our MongoDB database using Mongoose.

const mongoose = require("mongoose");
const seedAdmin = require("./seedAdmin");

// This function connects to the MongoDB database.
// It is an async function because connecting to a database takes time.
const connectDB = async () => {
  try {
    // We try to connect using the MONGO_URI from our environment variables (.env file)
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
    
    // Auto-seed admin user
    await seedAdmin();
  } catch (error) {
    // If the connection fails, log the error message
    console.error("MongoDB Connection Failed:", error.message);
    
    // Stop the Node server because the database is required for our application to work
    process.exit(1);
  }
};

module.exports = connectDB;