


const mongoose = require("mongoose");
const seedAdmin = require("./seedAdmin");



const connectDB = async () => {
  try {
    
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected Successfully");
    
    
    await seedAdmin();
  } catch (error) {
    
    console.error("MongoDB Connection Failed:", error.message);
    
    
    process.exit(1);
  }
};

module.exports = connectDB;