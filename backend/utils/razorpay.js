const Razorpay = require('razorpay');

let instance;

const getRazorpayInstance = () => {
  if (instance) return instance;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured in environment variables.');
  }
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return instance;
};

module.exports = getRazorpayInstance;
