const express = require("express");
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/razorpay/create-order", paymentController.createRazorpayOrder);
router.post("/razorpay/verify", paymentController.verifyRazorpayPayment);

router.post(
  "/stripe/create-checkout-session",
  paymentController.createStripeCheckoutSession,
);
router.get(
  "/stripe/session/:sessionId",
  paymentController.getStripeSessionStatus,
);

router.post("/cod/create-order", paymentController.createCODOrder);

module.exports = router;
