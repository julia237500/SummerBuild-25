import { useState, useEffect } from 'react';
import { FaCrown, FaCheck, FaCreditCard, FaHistory } from 'react-icons/fa';
import { stripeService } from '../services/stripeService';
import PaymentMethods from './PaymentMethods';
import BillingHistory from './BillingHistory';
import './Subscription.css';

export default function Subscription() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('plans');
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stripeService.getCurrentSubscription();
      setCurrentSubscription(data);
    } catch (err) {
      setError('Failed to load subscription details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    try {
      setLoading(true);
      setError(null);
      await stripeService.createCheckoutSession(planType, isYearly ? 'yearly' : 'monthly');
    } catch (err) {
      setError('Failed to start subscription process');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      await stripeService.cancelSubscription();
      await fetchCurrentSubscription();
    } catch (err) {
      setError('Failed to cancel subscription');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Basic recipe search',
        'Save up to 5 recipes',
        'Basic nutrition info'
      ]
    },
    {
      name: 'Premium',
      price: { monthly: 9.99, yearly: 99.99 },
      features: [
        'Everything in Free',
        'Unlimited recipe saves',
        'Detailed nutrition analysis',
        'Meal planning tools',
        'Shopping list generator'
      ]
    },
    {
      name: 'Professional',
      price: { monthly: 19.99, yearly: 199.99 },
      features: [
        'Everything in Premium',
        'Recipe scaling tools',
        'Ingredient substitutions',
        'Custom recipe creation',
        'Priority support'
      ]
    }
  ];

  if (loading && !currentSubscription) {
    return <div className="loading">Loading subscription details...</div>;
  }

  return (
    <div className="subscription-page">
      <h1>Subscription</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="subscription-tabs">
        <button
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <FaCrown />
          Plans
        </button>
        <button
          className={`tab ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          <FaCreditCard />
          Payment Methods
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory />
          Billing History
        </button>
      </div>

      {activeTab === 'plans' && (
        <>
          <div className="billing-toggle">
            <span className={!isYearly ? 'active' : ''}>Monthly</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isYearly}
                onChange={() => setIsYearly(!isYearly)}
              />
              <span className="slider"></span>
            </label>
            <span className={isYearly ? 'active' : ''}>
              Yearly <span className="savings">Save 20%</span>
            </span>
          </div>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`plan-card ${
                  currentSubscription?.plan === plan.name.toLowerCase()
                    ? 'current'
                    : ''
                }`}
              >
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="amount">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="period">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
                <ul className="features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <FaCheck /> {feature}
                    </li>
                  ))}
                </ul>
                {currentSubscription?.plan === plan.name.toLowerCase() ? (
                  <button
                    onClick={handleCancel}
                    className="cancel-btn"
                    disabled={loading || plan.name === 'Free'}
                  >
                    Cancel Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.name.toLowerCase())}
                    className="subscribe-btn"
                    disabled={loading || (currentSubscription && plan.name === 'Free')}
                  >
                    {loading ? 'Processing...' : 'Subscribe'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'payment' && <PaymentMethods />}
      {activeTab === 'history' && <BillingHistory />}
    </div>
  );
} 