const Order = require("../models/Order");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendOrderStatusUpdateEmail } = require("../utils/sendEmail");

exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res
    .status(200)
    .json({ success: true, results: orders.length, data: { orders } });
});

exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) return next(new AppError("Order not found.", 404));

  if (
    String(order.user._id) !== String(req.user._id) &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("Not authorized to view this order.", 403));
  }
  res.status(200).json({ success: true, data: { order } });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new AppError("Order not found.", 404));

  if (String(order.user) !== String(req.user._id)) {
    return next(new AppError("Not authorized.", 403));
  }
  if (["shipped", "delivered"].includes(order.orderStatus)) {
    return next(new AppError("This order can no longer be cancelled.", 400));
  }

  order.orderStatus = "cancelled";
  order.cancelReason = req.body.reason || "Cancelled by customer";
  order.statusHistory.push({ status: "cancelled", note: order.cancelReason });
  await order.save();

  res.status(200).json({ success: true, data: { order } });
});

// ---------- ADMIN ----------

exports.getAllOrders = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    results: orders.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: { orders },
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status, trackingNumber, note } = req.body;
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );
  if (!order) return next(new AppError("Order not found.", 404));

  const validStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return next(new AppError("Invalid order status.", 400));
  }

  order.orderStatus = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  order.statusHistory.push({ status, note });
  await order.save();

  // Do not block admin response on email delivery.
  // Fire-and-forget to keep API fast; log failures for observability.
  try {
    void sendOrderStatusUpdateEmail(order.user, order).catch((err) => {
      console.error("Status update email failed:", err.message);
    });
  } catch (err) {
    console.error("Status update email init failed:", err.message);
  }

  res.status(200).json({ success: true, data: { order } });
});

exports.getDashboardStats = catchAsync(async (req, res) => {
  const [totalOrders, totalRevenueAgg, pendingOrders, totalUsers] =
    await Promise.all([
      Order.countDocuments({ isPaid: true }),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Order.countDocuments({ orderStatus: "pending" }),
      User.countDocuments({ role: "customer" }),
    ]);

  const recentOrders = await Order.find({ isPaid: true })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
      pendingOrders,
      totalUsers,
      recentOrders,
    },
  });
});
