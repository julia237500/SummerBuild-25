import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SubscriptionPage.css'; // Reuse your subscription styles if you like

function SubscriptionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="subscription-container">
      <div className="subscription-card">
        <h2>Thank you for subscribing!</h2>
        <p className="subtitle">Your subscription was successful.</p>
        <p>You will be redirected to the home page shortly.</p>
        <button className="subscribe-btn" onClick={() => navigate('/')}>
          Go to Home Now
        </button>
      </div>
    </div>
  );
}

export default SubscriptionSuccess;