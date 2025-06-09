const express = require('express');
const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Create a checkout session
router.post('/create-checkout-session', asyncHandler(async (req, res) => {
  const { priceId, successUrl, cancelUrl } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
}));

// Get subscription status
router.get('/subscription-status', asyncHandler(async (req, res) => {
  // TODO: Implement subscription status check
  res.json({ plan: null });
}));

// Cancel subscription
router.post('/cancel-subscription', asyncHandler(async (req, res) => {
  // TODO: Implement subscription cancellation
  res.json({ success: true });
}));

module.exports = router; 