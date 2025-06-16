import { useState } from 'react';
import axios from 'axios';

const PLANS = [
  { label: 'Monthly', priceId: 'price_1RZjsa4KNalnlaUF1T2ar4bZ' }, // Replace with your real Price ID
  { label: 'Yearly', priceId: 'price_1RZk8i4KNalnlaUFkiao2rYS' },   // Replace with your real Price ID
];

function SubscriptionPage() {
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0].priceId);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const res = await axios.post('/api/stripe/create-checkout-session', {
      email,
      priceId: selectedPlan,
    });
    window.location = res.data.url;
  };

  return (
    <form onSubmit={handleSubscribe}>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        required
        onChange={e => setEmail(e.target.value)}
      />
      <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}>
        {PLANS.map(plan => (
          <option key={plan.priceId} value={plan.priceId}>{plan.label}</option>
        ))}
      </select>
      <button type="submit">Subscribe</button>
    </form>
  );
}

export default SubscriptionPage;