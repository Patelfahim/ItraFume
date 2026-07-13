const crypto = require("crypto");
const getRazorpay = require("../utils/razorpay");
const getStripe = require("../utils/stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendOrderConfirmationEmail } = require("../utils/sendEmail");

const buildOrderItemsFromCart = async (cartItems) => {
  const orderItems = [];
  let itemsPrice = 0;

  for (const ci of cartItems) {
    const product = await Product.findById(ci.productId);
    if (!product || !product.isActive) {
      throw new AppError(
        `Product not found or unavailable: ${ci.productId}`,
        400,
      );
    }
    const variant = product.variants.id(ci.variantId);
    if (!variant) {
      throw new AppError(
        `Selected variant not found for product ${product.name}`,
        400,
      );
    }
    if (variant.stock < ci.quantity) {
      throw new AppError(
        `Insufficient stock for ${product.name} (${variant.size}). Only ${variant.stock} left.`,
        400,
      );
    }

    const lineTotal = variant.price * ci.quantity;
    itemsPrice += lineTotal;

    orderItems.push({
      product: product._id,
      variantId: variant._id,
      name: product.name,
      size: variant.size,
      image: product.media.find((m) => m.type === "image")?.url || "",
      price: variant.price,
      quantity: ci.quantity,
    });
  }

  return { orderItems, itemsPrice };
};

const decrementStock = async (orderItems) => {
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product, "variants._id": item.variantId },
      {
        $inc: { "variants.$.stock": -item.quantity, totalSold: item.quantity },
      },
    );
  }
};

// ============ RAZORPAY ============

exports.createRazorpayOrder = catchAsync(async (req, res, next) => {
  const {
    cartItems,
    shippingAddress,
    shippingPrice = 0,
    taxPrice = 0,
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new AppError("Your cart is empty.", 400));
  }

  const { orderItems, itemsPrice } = await buildOrderItemsFromCart(cartItems);
  const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice);

  const razorpay = getRazorpay();
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(totalPrice * 100), // paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    notes: { userId: String(req.user._id) },
  });

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    currency: "INR",
    paymentGateway: "razorpay",
    paymentResult: { orderId: rzpOrder.id, status: "created" },
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order._id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

exports.verifyRazorpayPayment = catchAsync(async (req, res, next) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return next(new AppError("Order not found.", 404));
  if (String(order.user) !== String(req.user._id)) {
    return next(new AppError("Not authorized for this order.", 403));
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    order.paymentStatus = "failed";
    await order.save();
    return next(
      new AppError("Payment verification failed. Signature mismatch.", 400),
    );
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = "paid";
  order.orderStatus = "processing";
  order.paymentResult = {
    id: razorpay_payment_id,
    orderId: razorpay_order_id,
    signature: razorpay_signature,
    status: "paid",
    updateTime: new Date().toISOString(),
  };
  order.statusHistory.push({
    status: "processing",
    note: "Payment verified via Razorpay",
  });
  await order.save();

  await decrementStock(order.items);

  const user = await User.findById(req.user._id);
  try {
    await sendOrderConfirmationEmail(user, order);
  } catch (err) {
    console.error("Order confirmation email failed:", err.message);
  }

  res.status(200).json({ success: true, data: { order } });
});

exports.razorpayWebhook = catchAsync(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");

  if (signature !== expected) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid webhook signature" });
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "payment.captured") {
    const rzpOrderId = event.payload.payment.entity.order_id;
    const order = await Order.findOne({ "paymentResult.orderId": rzpOrderId });
    if (order && order.paymentStatus !== "paid") {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      await order.save();
      await decrementStock(order.items);
    }
  }

  res.status(200).json({ received: true });
});

// ============ STRIPE ============

exports.createStripeCheckoutSession = catchAsync(async (req, res, next) => {
  const {
    cartItems,
    shippingAddress,
    shippingPrice = 0,
    taxPrice = 0,
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new AppError("Your cart is empty.", 400));
  }

  const { orderItems, itemsPrice } = await buildOrderItemsFromCart(cartItems);
  const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    currency: "INR", 
    paymentGateway: "stripe",
  });

  const stripe = getStripe();

  const inrToUsdRate = Number(process.env.STRIPE_INR_TO_USD_RATE) || 83;
  const toUsdCents = (inrAmount) =>
    Math.round((inrAmount / inrToUsdRate) * 100);

  const line_items = orderItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: { name: `${item.name} (${item.size})` },
      unit_amount: toUsdCents(item.price),
    },
    quantity: item.quantity,
  }));

  if (Number(shippingPrice) > 0) {
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Shipping" },
        unit_amount: toUsdCents(shippingPrice),
      },
      quantity: 1,
    });
  }
  if (Number(taxPrice) > 0) {
    line_items.push({
      price_data: {
        currency: "usd",
        product_data: { name: "Tax" },
        unit_amount: toUsdCents(taxPrice),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items,
    customer_email: req.user.email,
    success_url: `${process.env.CLIENT_URL}/order-success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
    metadata: { orderId: String(order._id), userId: String(req.user._id) },
  });

  order.paymentResult = { orderId: session.id, status: "created" };
  await order.save();

  res
    .status(201)
    .json({
      success: true,
      data: { sessionId: session.id, url: session.url, orderId: order._id },
    });
});

exports.stripeWebhook = catchAsync(async (req, res) => {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const order = await Order.findById(session.metadata.orderId);

    if (order && order.paymentStatus !== "paid") {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = "paid";
      order.orderStatus = "processing";
      order.paymentResult = {
        id: session.payment_intent,
        orderId: session.id,
        status: "paid",
        updateTime: new Date().toISOString(),
        email: session.customer_email,
      };
      order.statusHistory.push({
        status: "processing",
        note: "Payment confirmed via Stripe",
      });
      await order.save();
      await decrementStock(order.items);

      const user = await User.findById(order.user);
      try {
        await sendOrderConfirmationEmail(user, order);
      } catch (err) {
        console.error("Order confirmation email failed:", err.message);
      }
    }
  }

  res.status(200).json({ received: true });
});

exports.getStripeSessionStatus = catchAsync(async (req, res, next) => {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
  res
    .status(200)
    .json({ success: true, data: { status: session.payment_status } });
});

// ============ CASH ON DELIVERY (COD) ============

exports.createCODOrder = catchAsync(async (req, res, next) => {
  const {
    cartItems,
    shippingAddress,
    shippingPrice = 0,
    taxPrice = 0,
  } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return next(new AppError("Your cart is empty.", 400));
  }

  const { orderItems, itemsPrice } = await buildOrderItemsFromCart(cartItems);
  const totalPrice = itemsPrice + Number(shippingPrice) + Number(taxPrice);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    currency: "INR",
    paymentGateway: "cod",
    paymentStatus: "pending", 
    orderStatus: "processing", 
    paymentResult: {
      status: "pending",
      updateTime: new Date().toISOString(),
    },
  });

  order.statusHistory.push({
    status: "processing",
    note: "Order confirmed. Awaiting payment on delivery.",
  });
  await order.save();

  await decrementStock(order.items);

  const user = await User.findById(req.user._id);
  try {
    await sendOrderConfirmationEmail(user, order);
  } catch (err) {
    console.error("Order confirmation email failed:", err.message);
  }

  res.status(201).json({
    success: true,
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalPrice,
      message: "Order placed successfully. Please pay on delivery.",
    },
  });
});
