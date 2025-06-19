import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

// Only allow this admin email
const ADMIN_EMAIL = 'admin@abc.com';

function passwordChecks(password) {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function AdminProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [admin, setAdmin] = useState({ email: ADMIN_EMAIL, password: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [checks, setChecks] = useState(passwordChecks(''));

  // Load admin info from Supabase
  useEffect(() => {
    async function fetchAdmin() {
      const { data } = await supabase
        .from('admin_accounts')
        .select('email,password')
        .eq('email', ADMIN_EMAIL)
        .single();
      if (data) setAdmin(data);
    }
    fetchAdmin();
  }, []);

  useEffect(() => {
    setChecks(passwordChecks(newPassword));
  }, [newPassword]);

  const allChecksPassed = Object.values(checks).every(Boolean);
  const confirmMatch = newPassword && confirm && newPassword === confirm;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    if (oldPassword !== admin.password) {
      setMsg('Old password is incorrect');
      return;
    }
    if (!allChecksPassed) {
      setMsg('Password does not meet requirements');
      return;
    }
    if (!confirmMatch) {
      setMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('admin_accounts')
      .update({ password: newPassword, updated_at: new Date().toISOString() })
      .eq('email', ADMIN_EMAIL);
    setLoading(false);
    if (error) {
      setMsg('Failed to update password');
    } else {
      setMsg('Password updated successfully');
      setAdmin(a => ({ ...a, password: newPassword }));
      setOldPassword('');
      setNewPassword('');
      setConfirm('');
    }
  };

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(120deg, #e3f2fd 0%, #f4f6fa 100%)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 6px 32px #0002',
        padding: '40px 36px 32px 36px',
        maxWidth: 420,
        width: '100%',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 30,
          fontWeight: 800,
          marginBottom: 18,
          textAlign: 'center',
          color: '#3498db',
          letterSpacing: 1
        }}>
          Admin Profile
        </h1>
        <div style={{
          marginBottom: 24,
          background: '#f8fafc',
          borderRadius: 10,
          padding: '18px 18px 10px 18px',
          boxShadow: '0 1px 4px #0001'
        }}>
          <div style={{ marginBottom: 10, fontSize: 16 }}>
            <b>Email:</b> <span style={{ color: '#222c36' }}>{ADMIN_EMAIL}</span>
          </div>
          <div style={{ marginBottom: 0, fontSize: 16 }}>
            <b>Password:</b>{' '}
            <span style={{ letterSpacing: 2 }}>
              {showPassword ? admin.password : '••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                marginLeft: 14,
                background: 'none',
                border: 'none',
                color: '#4CAF50',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <form onSubmit={handleChangePassword} style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, color: '#222c36', marginBottom: 4, display: 'block' }}>Old Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #e3f2fd',
                fontSize: 15,
                background: '#f8fafc'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, color: '#222c36', marginBottom: 4, display: 'block' }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #e3f2fd',
                fontSize: 15,
                background: '#f8fafc'
              }}
              required
            />
            <ul style={{
              fontSize: 13,
              margin: '10px 0 0 0',
              padding: 0,
              listStyle: 'none',
              color: '#222c36'
            }}>
              <li style={{ color: checks.length ? '#4CAF50' : '#e74c3c', marginBottom: 2 }}>
                {checks.length ? '✔' : '✖'} At least 8 characters
              </li>
              <li style={{ color: checks.lowercase ? '#4CAF50' : '#e74c3c', marginBottom: 2 }}>
                {checks.lowercase ? '✔' : '✖'} Contains lowercase letter
              </li>
              <li style={{ color: checks.uppercase ? '#4CAF50' : '#e74c3c', marginBottom: 2 }}>
                {checks.uppercase ? '✔' : '✖'} Contains uppercase letter
              </li>
              <li style={{ color: checks.number ? '#4CAF50' : '#e74c3c', marginBottom: 2 }}>
                {checks.number ? '✔' : '✖'} Contains number
              </li>
              <li style={{ color: checks.special ? '#4CAF50' : '#e74c3c', marginBottom: 2 }}>
                {checks.special ? '✔' : '✖'} Contains special character
              </li>
            </ul>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, color: '#222c36', marginBottom: 4, display: 'block' }}>Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                border: '1px solid #e3f2fd',
                fontSize: 15,
                background: '#f8fafc'
              }}
              required
            />
            <div style={{
              fontSize: 13,
              marginTop: 6,
              color: confirm
                ? (confirmMatch ? '#4CAF50' : '#e74c3c')
                : '#888'
            }}>
              {confirm
                ? (confirmMatch ? '✔ Passwords match' : '✖ Passwords do not match')
                : ''}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !allChecksPassed || !confirmMatch}
            style={{
              background: loading || !allChecksPassed || !confirmMatch ? '#b2dfdb' : '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 17,
              width: '100%',
              marginTop: 8,
              cursor: loading || !allChecksPassed || !confirmMatch ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #0001'
            }}
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
          {msg && (
            <div style={{
              marginTop: 16,
              color: msg.includes('success') ? '#2ecc71' : '#e74c3c',
              textAlign: 'center',
              fontWeight: 600
            }}>
              {msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
