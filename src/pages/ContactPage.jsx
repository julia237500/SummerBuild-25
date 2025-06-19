import { useState } from 'react';
import supabase from '../services/supabaseClient';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      // Check if supabase client is initialized
      if (!supabase || !supabase.from) {
        setError('Supabase client is not initialized.');
        return;
      }
      // Check for required fields
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        setError('All fields are required.');
        return;
      }
      // Insert feedback
      const { data, error } = await supabase
        .from('feedback')
        .insert([
          {
            name: form.name,
            email: form.email,
            message: form.message
          }
        ]);
      if (error) {
        setError(error.message || 'Failed to send feedback. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch (err) {
      // If error is a network error, show a more helpful message
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setError('Network error: Unable to reach Supabase. Please check your internet connection or Supabase configuration.');
      } else {
        setError('Failed to send feedback. Please try again.');
      }
    }
  };

  return (
    <div style={{
      maxWidth: 600,
      margin: '40px auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px #0001',
      padding: 32
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Contact Us</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Have a suggestion or feedback? The RecipeHub team would love to hear from you!
        <br />
        <span style={{ color: '#4CAF50', fontWeight: 600 }}>Our Story:</span> RecipeHub was started by a group of foodies who wanted to make cooking fun, social, and accessible for everyone. Whether you’re a beginner or a pro chef, we’re here to help you on your culinary journey.
      </p>
      <div style={{ marginBottom: 24 }}>
        <strong>Email:</strong> support@recipehub.com<br />
        <strong>Phone:</strong> +1 (555) 123-4567<br />
        <strong>Address:</strong> 123 Foodie Lane, Flavor Town, USA
      </div>
      <hr style={{ margin: '24px 0' }} />
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>Send us a feedback</h2>
      {submitted ? (
        <div style={{ color: '#2ecc71', fontWeight: 600, fontSize: 18, marginTop: 24 }}>
          Thank you for reaching out! We'll get back to you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ color: '#e74c3c', marginBottom: 12 }}>{error}</div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                border: '1px solid #e3f2fd'
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                border: '1px solid #e3f2fd'
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Feedback</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                border: '1px solid #e3f2fd'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Send Feedback
          </button>
        </form>
      )}
    </div>
  );
}
