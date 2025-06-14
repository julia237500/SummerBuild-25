const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.VITE_STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
    try {
    const { email, priceId } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId, // Use the priceId sent from the frontend
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/subscription-success`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
      customer_email: req.body.email,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;