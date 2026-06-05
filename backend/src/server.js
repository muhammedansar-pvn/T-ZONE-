const express=require("express")
const cors= require("cors")
const dotenv=require("dotenv")
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config()

connectDB();
const app= express()

app.use(cors())
app.use(express.json())

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Register user routes on both /users and /api/users for frontend compatibility
app.use("/users", userRoutes);
app.use("/api/users", userRoutes);

// Register payment routes on /payments and /api/payments
app.use("/payments", paymentRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/",(req,res)=>{
    res.json({
        success:true,
        message:"T-ZONE Backend running"
    })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
