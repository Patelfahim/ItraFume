const Stripe = require('stripe');

let stripeClient;

const getStripe = () => {
  if (stripeClient) return stripeClient;
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key is not configured in environment variables.');
  }
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });
  return stripeClient;
};

module.exports = getStripe;
