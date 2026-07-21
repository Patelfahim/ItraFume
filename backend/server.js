require("dotenv").config();

const express = require("express");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const path = require("path");

const connectDB = require("./config/db");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bespokeRoutes = require("./routes/bespokeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const paymentController = require("./controllers/paymentController");

connectDB();

const app = express();

app.set("trust proxy", 1); // needed behind reverse proxies (Render, Railway, Nginx, etc.) for correct rate-limit/IP + secure cookies

// ---------- SECURITY MIDDLEWARE ----------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow images/videos to be embedded by the frontend origin
  }),
);

console.log("CLIENT_URL =", process.env.CLIENT_URL);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
// Ensure preflight requests succeed for cookie-based auth (mobile / different origins).
app.options("*", cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.get("/", (req, res) => {
  res.send("ItraFume Backend is running 🚀");
});
// Serve uploaded media files (local fallback for development)
// In production, media should be served via Cloudinary URLs.
// This ensures old products with /uploads/ paths still work.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Also serve /media/ paths for seed data images (from frontend/public/media/)
// This allows seed data images to work when frontend (Vercel) calls backend (Render)
const frontendPublicMedia = path.join(
  __dirname,
  "..",
  "frontend",
  "public",
  "media",
);
if (require("fs").existsSync(frontendPublicMedia)) {
  app.use("/media", express.static(frontendPublicMedia));
}

// Webhooks need the RAW body for signature verification, so they must be
// registered BEFORE the global express.json() body parser.
app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook,
);
app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  paymentController.razorpayWebhook,
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(compression());

app.use(mongoSanitize()); // strips $ and . from req.body/query/params to prevent NoSQL injection
app.use(xss()); // sanitizes user input from malicious HTML/JS (XSS)
app.use(hpp()); // prevents HTTP parameter pollution

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Global rate limiter (in addition to the stricter one on auth routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
});
app.use("/api", globalLimiter);

// ---------- ROUTES ----------
app.get("/api/health", (req, res) =>
  res.status(200).json({ success: true, message: "ItraFume API is running." }),
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bespoke", bespokeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// Serve frontend build in production (if deployed as a single service)
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDist));

  // SPA fallback: always serve index.html for non-API deep links.
  // This prevents 404 on refresh for routes like /shop or /product/:slug.
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) return next();
    return res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.all("*", (req, res, next) => {
  // If frontend SPA fallback didn't match (e.g. method other than GET),
  // still try to serve index.html so refresh on deep links works.
  if (
    process.env.NODE_ENV === "production" &&
    req.originalUrl &&
    !req.originalUrl.startsWith("/api")
  ) {
    const frontendDist = path.join(__dirname, "..", "frontend", "dist");
    return res.sendFile(path.join(frontendDist, "index.html"));
  }
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `ItraFume API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! Shutting down...", err.name, err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully.");
  server.close(() => console.log("Process terminated."));
});

module.exports = app;
