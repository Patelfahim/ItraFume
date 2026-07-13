const mongoose = require("mongoose");

const generateOrderNumber = () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ITF${Date.now().toString().slice(-8)}${rand}`;
};

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generateOrderNumber,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: function () {
        return this.paymentGateway === "cod" ? "pending" : "pending";
      },
    },
    paymentResult: {
      id: { type: String }, // razorpay_payment_id or stripe payment_intent id
      orderId: { type: String }, // razorpay_order_id or stripe session id
      signature: { type: String },
      status: { type: String },
      updateTime: { type: String },
      email: { type: String },
    },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [
      {
        status: { type: String },
        note: { type: String },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    trackingNumber: { type: String },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true },
);

orderSchema.pre("validate", function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
