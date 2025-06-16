import { useState } from 'react';

// Demo: Use localStorage for admin password (replace with secure backend in production)
function getAdminEmail() {
  return localStorage.getItem('admin_email') || 'admin@abc.com';
}
function getAdminPassword() {
  // Always default to 'Recipehub123$' if not set in localStorage
  return 'Recipehub123$';
}

export default function AdminProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const email = getAdminEmail();
  const password = getAdminPassword();

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Admin Profile</h1>
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 32, maxWidth: 400 }}>
        <div style={{ marginBottom: 16 }}>
          <b>Email:</b> {email}
        </div>
        <div style={{ marginBottom: 16 }}>
          <b>Password:</b>{' '}
          <span>
            {showPassword ? password : '••••••••'}
          </span>
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              marginLeft: 12,
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
    </div>
  );
}
