const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");


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
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

connectDB();
const app = express();

app.use(helmet({
  crossOriginOpenerPolicy: false
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // limit each IP to 100 requests in production, 10000 in development
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

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


app.use("/api/users", userRoutes);


app.use("/payments", paymentRoutes);
app.use("/api/payments", paymentRoutes);

const { ensureUploadsExists } = require("./utils/fileSystem");
const uploadRoutes = require("./routes/uploadRoutes");

ensureUploadsExists();

app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);

app.get("/",(req,res)=>{
    res.json({
        success:true,
        message:"T-ZONE Backend running"
    })
})


const AppError = require("./utils/AppError");
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

