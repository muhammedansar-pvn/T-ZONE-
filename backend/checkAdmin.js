// checkAdmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/User");

mongoose.connect(process.env.MONGO_URI);

async function check() {
  const users = await User.find({});
  console.log(users);
  process.exit();
}

check();