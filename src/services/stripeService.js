import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PLAN_PRICES = {
  premium: {
    monthly: 'price_monthly_premium_id',
    yearly: 'price_yearly_premium_id'
  },
  professional: {
    monthly: 'price_monthly_professional_id',
    yearly: 'price_yearly_professional_id'
  }
};

export const stripeService = {
  // Initialize checkout session
  createCheckoutSession: async (planType, billingCycle) => {
    try {
      // Call your backend to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: PLAN_PRICES[planType][billingCycle],
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription`,
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },

  // Get current subscription status
  getCurrentSubscription: async () => {
    try {
      const response = await fetch('/api/subscription-status');
      return response.json();
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async () => {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
      });
      return response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Update subscription
  updateSubscription: async (newPlanType, newBillingCycle) => {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPriceId: PLAN_PRICES[newPlanType][newBillingCycle],
        }),
      });
      return response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await fetch('/api/payment-methods');
      return response.json();
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  // Add new payment method
  addPaymentMethod: async () => {
    try {
      // Get setup intent
      const response = await fetch('/api/create-setup-intent');
      const { clientSecret } = await response.json();

      const stripe = await stripePromise;
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement('card'),
          billing_details: {
            name: 'User Name', // Replace with actual user name
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return setupIntent;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  },

  // Remove payment method
  removePaymentMethod: async (paymentMethodId) => {
    try {
      const response = await fetch('/api/remove-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });
      return response.json();
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (paymentMethodId) => {
    try {
      const response = await fetch('/api/set-default-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      });
      return response.json();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  // Get subscription history
  getSubscriptionHistory: async () => {
    try {
      const response = await fetch('/api/subscription-history');
      return response.json();
    } catch (error) {
      console.error('Error fetching subscription history:', error);
      throw error;
    }
  },

  // Get invoices
  getInvoices: async () => {
    try {
      const response = await fetch('/api/invoices');
      return response.json();
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  // Download invoice PDF
  downloadInvoice: async (invoiceId) => {
    try {
      const response = await fetch(`/api/invoice-pdf/${invoiceId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  },

  // Apply coupon code
  applyCoupon: async (couponCode) => {
    try {
      const response = await fetch('/api/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ couponCode }),
      });
      return response.json();
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  },

  // Get available promotions
  getPromotions: async () => {
    try {
      const response = await fetch('/api/promotions');
      return response.json();
    } catch (error) {
      console.error('Error fetching promotions:', error);
      throw error;
    }
  }
}; 