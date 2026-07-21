const express = require("express");
const orderController = require("../controllers/orderController");
const productController = require("../controllers/productController");
const reviewController = require("../controllers/reviewController");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.use(protect, restrictTo("admin"));

router.get("/dashboard-stats", orderController.getDashboardStats);

router.get("/orders", orderController.getAllOrders);
router.patch("/orders/:id/status", orderController.updateOrderStatus);
router.patch("/orders/:id/mark-paid", orderController.markOrderAsPaid);

router.get("/products", productController.getAllProductsAdmin);

router.get("/reviews", reviewController.getAllReviewsAdmin);

router.get(
  "/users",
  catchAsync(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, results: users.length, data: { users } });
  }),
);

router.patch(
  "/users/:id/toggle-active",
  catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError("User not found.", 404));
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: { user } });
  }),
);

module.exports = router;
