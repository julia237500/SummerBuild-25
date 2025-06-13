import { useState } from 'react';
import axios from 'axios';

function Subscription() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await axios.post('/api/stripe/create-checkout-session', { email });
    window.location = res.data.url;
  };

  return (
    <div>
      <h2>Subscribe to a meal plan</h2>
      <form onSubmit={handleSubscribe}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Redirecting...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}

export default Subscription;