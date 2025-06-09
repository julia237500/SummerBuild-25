import { useState } from 'react';
import supabase from '../services/supabaseClient';

const ERROR_TYPES = [
  { key: 'missing_title', label: 'Missing Title (400)' },
  { key: 'corrupted_image', label: 'Corrupted Image (400)' },
  { key: 'oversized_payload', label: 'Oversized Payload (413)' },
  { key: 'permission_error', label: 'Permission Error (403)' },
  { key: 'supabase_down', label: 'Supabase Down (simulate 500)' },
  { key: 'delete_nonexistent', label: 'Delete Nonexistent Recipe (404)' },
  { key: 'update_invalid', label: 'Update with Invalid Data (400)' }
];

export default function ErrorSimulator() {
  const [selectedError, setSelectedError] = useState(ERROR_TYPES[0].key);
  const [apiResponse, setApiResponse] = useState('');
  const [frontendError, setFrontendError] = useState('');
  const [logging, setLogging] = useState(false);

  // Simulate API error based on selected type
  const simulateError = async () => {
    setApiResponse('');
    setFrontendError('');
    setLogging(false);

    try {
      let res, data;
      switch (selectedError) {
        case 'missing_title':
          res = await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredients: 'Eggs', instructions: 'Cook' }) // missing title
          });
          data = await res.json();
          if (!res.ok) throw new Error(data.error || '400 Bad Request');
          break;
        case 'corrupted_image':
          res = await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Test', image_url: 'not-a-real-image', ingredients: 'Eggs', instructions: 'Cook' })
          });
          data = await res.json();
          if (!res.ok) throw new Error(data.error || '400 Bad Request');
          break;
        case 'oversized_payload':
          // Send a huge string
          res = await fetch('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: 'Big',
              ingredients: 'Eggs',
              instructions: 'Cook',
              notes: 'x'.repeat(2 * 1024 * 1024) // 2MB+
            })
          });
          data = await res.json();
          if (!res.ok) throw new Error(data.error || '413 Payload Too Large');
          break;
        case 'permission_error':
          // Try to delete a recipe with no auth (simulate 403)
          res = await fetch('/api/admin/recipes/1', {
            method: 'DELETE'
          });
          data = await res.json();
          if (!res.ok) throw new Error(data.error || '403 Forbidden');
          break;
        case 'supabase_down':
          // Try to fetch from a fake endpoint to simulate downtime
          try {
            await fetch('https://fake.supabase.io/rest/v1/recipes');
          } catch (err) {
            throw new Error('Supabase network error (simulated)');
          }
          throw new Error('Supabase network error (simulated)');
        case 'delete_nonexistent':
          res = await fetch('/api/recipes/999999', { method: 'DELETE' });
          data = await res.json();
          if (!res.ok) throw new Error(data.error || '404 Not Found');
          break;
        case 'update_invalid':
          res = await fetch('/api/recipes/1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: '' }) // invalid update
          });
          data = await res.json();
          if (!res.ok) throw new Error(data.error || '400 Bad Request');
          break;
        default:
          throw new Error('Unknown error type');
      }
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setFrontendError(err.message);
      setApiResponse(err.stack || String(err));
      // Optionally log error to Supabase
      setLogging(true);
      try {
        await supabase.from('error_logs').insert([
          {
            error_type: selectedError,
            message: err.message,
            stack: err.stack || '',
            created_at: new Date().toISOString()
          }
        ]);
      } catch (logErr) {
        // Ignore logging errors
      }
      setLogging(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>⚠️ Error Simulator</h1>
      <p style={{ marginBottom: 20, color: '#666' }}>
        Intentionally trigger errors to test your frontend and backend error handling.
      </p>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 600, marginRight: 12 }}>Choose error type:</label>
        <select
          value={selectedError}
          onChange={e => setSelectedError(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 220 }}
        >
          {ERROR_TYPES.map(e => (
            <option key={e.key} value={e.key}>{e.label}</option>
          ))}
        </select>
        <button
          onClick={simulateError}
          style={{
            marginLeft: 18,
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 28px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer'
          }}
        >
          Simulate Error
        </button>
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Raw API Response / Error</h3>
        <pre style={{
          background: '#f9f9f9',
          border: '1px solid #eee',
          borderRadius: 8,
          padding: 16,
          minHeight: 80,
          color: '#c0392b'
        }}>
          {apiResponse}
        </pre>
        {frontendError && (
          <div style={{
            marginTop: 16,
            color: '#e74c3c',
            fontWeight: 600,
            fontSize: 16
          }}>
            {frontendError}
          </div>
        )}
        {logging && (
          <div style={{ color: '#888', marginTop: 8 }}>Logging error to Supabase...</div>
        )}
      </div>
      <div style={{ marginTop: 32, color: '#888', fontSize: 14 }}>
        <b>Use cases:</b> Test frontend error handling, backend responses, simulate downtime, permission errors, and more.
      </div>
    </div>
  );
}
