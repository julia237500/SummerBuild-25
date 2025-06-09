import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import './SubscriptionSuccess.css';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to subscription page after 5 seconds
    const timer = setTimeout(() => {
      navigate('/subscription');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="subscription-success">
      <div className="success-card">
        <FaCheckCircle className="success-icon" />
        <h1>Thank You!</h1>
        <p>Your subscription has been successfully activated.</p>
        <p className="sub-text">You now have access to all premium features.</p>
        <div className="redirect-message">
          You will be redirected to the subscription page in a few seconds...
        </div>
        <button
          onClick={() => navigate('/subscription')}
          className="return-btn"
        >
          Return to Subscription Page
        </button>
      </div>
    </div>
  );
} 