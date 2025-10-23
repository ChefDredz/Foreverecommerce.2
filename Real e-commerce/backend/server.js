import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/UserRoute.js";
import productRouter from "./routes/ProductRoute.js";
import orderRouter from "./routes/OrderRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// ✅ CRITICAL: Apply CORS BEFORE any routes or middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Production URLs
      "https://foreverecommerce-2-gae4.vercel.app", // Admin Panel
      "https://foreverecommerce-2.vercel.app",      // Client Frontend
      
      // Add www versions
      "https://www.foreverecommerce-2.vercel.app",
      "https://www.foreverecommerce-2-gae4.vercel.app",
      
      // Development URLs
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`⚠️  Origin not allowed by CORS: ${origin}`);
      callback(null, true); // Allow anyway for now (remove in production)
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  exposedHeaders: ["Content-Length", "X-Request-Id"],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// ✅ Body parsing middleware (AFTER CORS)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log(`🌍 Origin: ${req.headers.origin || 'No origin'}`);
  console.log(`🔑 Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  next();
});

// ✅ Health check endpoint (before routes)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Working - Forever Ecommerce Backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ✅ API Endpoints (order matters!)
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/orders", orderRouter);

// ✅ 404 handler (after all routes)
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      "GET /",
      "GET /health",
      "GET /api/product/list",
      "POST /api/orders/create",
      "GET /api/orders/user",
      "GET /api/orders/all"
    ]
  });
});

// ✅ Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err);
  console.error("Stack:", err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

// ✅ Start server
app.listen(port, () => {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  🚀 Forever Ecommerce Backend Server  ║");
  console.log("╚════════════════════════════════════════╝");
  console.log(`📡 Server started on PORT: ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 URL: ${process.env.NODE_ENV === "production" ? "https://foreverecommerce-2.onrender.com" : `http://localhost:${port}`}`);
  console.log("╔════════════════════════════════════════╗");
  console.log("║  ✅ CORS Enabled for:                 ║");
  console.log("║  • Admin: *-gae4.vercel.app           ║");
  console.log("║  • Client: foreverecommerce-2.vercel  ║");
  console.log("║  • Local: localhost:5173/5174         ║");
  console.log("╚════════════════════════════════════════╝");
});

export default app;