const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables immediately at startup
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

connectDB();
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));


app.use(express.json())
app.use(cookieParser())

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

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

// Catch all unhandled routes and forward a 404 AppError
const AppError = require("./utils/AppError");
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized error handling middleware
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

