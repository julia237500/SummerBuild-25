import { useState, useEffect } from 'react';
import { FaCreditCard, FaTrash, FaStar, FaPlus } from 'react-icons/fa';
import { stripeService } from '../services/stripeService';
import './PaymentMethods.css';

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddCard, setShowAddCard] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const methods = await stripeService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (err) {
      setError('Failed to load payment methods');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    try {
      setLoading(true);
      setError(null);
      await stripeService.addPaymentMethod();
      await fetchPaymentMethods();
      setShowAddCard(false);
    } catch (err) {
      setError('Failed to add payment method');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCard = async (paymentMethodId) => {
    try {
      setLoading(true);
      setError(null);
      await stripeService.removePaymentMethod(paymentMethodId);
      await fetchPaymentMethods();
    } catch (err) {
      setError('Failed to remove payment method');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (paymentMethodId) => {
    try {
      setLoading(true);
      setError(null);
      await stripeService.setDefaultPaymentMethod(paymentMethodId);
      await fetchPaymentMethods();
    } catch (err) {
      setError('Failed to set default payment method');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (last4) => `•••• •••• •••• ${last4}`;

  if (loading && !paymentMethods.length) {
    return <div className="loading">Loading payment methods...</div>;
  }

  return (
    <div className="payment-methods">
      <h2>Payment Methods</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="payment-methods-list">
        {paymentMethods.map((method) => (
          <div key={method.id} className={`payment-method-card ${method.isDefault ? 'default' : ''}`}>
            <div className="card-info">
              <FaCreditCard className="card-icon" />
              <div className="card-details">
                <span className="card-number">
                  {formatCardNumber(method.card.last4)}
                </span>
                <span className="card-expiry">
                  Expires {method.card.exp_month}/{method.card.exp_year}
                </span>
              </div>
            </div>
            
            <div className="card-actions">
              {!method.isDefault && (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  className="default-btn"
                  disabled={loading}
                >
                  <FaStar />
                  Make Default
                </button>
              )}
              <button
                onClick={() => handleRemoveCard(method.id)}
                className="remove-btn"
                disabled={loading || method.isDefault}
              >
                <FaTrash />
                Remove
              </button>
            </div>

            {method.isDefault && (
              <div className="default-badge">
                <FaStar /> Default
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowAddCard(true)}
          className="add-card-btn"
          disabled={loading}
        >
          <FaPlus />
          Add New Card
        </button>
      </div>

      {showAddCard && (
        <div className="add-card-modal">
          <div className="modal-content">
            <h3>Add New Card</h3>
            {/* Stripe Elements will be mounted here */}
            <div id="card-element"></div>
            <div className="modal-actions">
              <button
                onClick={() => setShowAddCard(false)}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 