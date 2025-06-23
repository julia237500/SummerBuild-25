import { useEffect, useRef, useState } from 'react';
import '../styles/SubscriptionPage.css';

function SubscriptionPage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const paypalRef = useRef();

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AVA0snjQntwKVdSl6JzsTdzttzAkFo0I1kCdsZdPVco3vlhAMtiJGDje54Q08fT2BpHwyk7pr7pj-Jq8&vault=true&intent=subscription";
    script.async = true;
    script.onload = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              'plan_id': 'P-9ST99790NY8971303NBKPGGI' // Replace with your PayPal sandbox plan ID
            });
          },
          onApprove: function(data, actions) {
            setSuccess('Subscription completed! ID: ' + data.subscriptionID);
          },
          onError: function(err) {
            setError('Payment failed. Please try again.');
          }
        }).render(paypalRef.current);
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="subscription-container">
      <div className="subscription-card">
        <h2>Subscribe to Us for only $9.99 per month!</h2>
        <p className="subtitle">Unlock premium recipes and features!</p>
        <div ref={paypalRef}></div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="subscription-benefits">
          <h4>Benefits:</h4>
          <ul>
            <li>Access exclusive recipes</li>
            <li>Save your favorites</li>
            <li>Priority support</li>
            <li>And more!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;