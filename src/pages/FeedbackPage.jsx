import { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterField, setFilterField] = useState('name');
  const [filterValue, setFilterValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchFeedback();
    // eslint-disable-next-line
  }, []);

  async function fetchFeedback() {
    setLoading(true);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    setFeedback(data || []);
    setLoading(false);
  }

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async (id) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    await fetchFeedback();
    if (error) {
      alert('Failed to delete feedback: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredFeedback = feedback.filter(fb => {
    if (!filterValue.trim()) return true;
    const val = filterValue.trim().toLowerCase();
    if (filterField === 'name') return fb.name.toLowerCase().includes(val);
    if (filterField === 'email') return fb.email.toLowerCase().includes(val);
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>User Feedback</h1>
      <div style={{ marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 500 }}>Filter by:</label>
        <select
          value={filterField}
          onChange={e => setFilterField(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
        </select>
        <input
          type="text"
          placeholder={`Search ${filterField}`}
          value={filterValue}
          onChange={e => setFilterValue(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : filteredFeedback.length === 0 ? (
        <div style={{ color: '#888' }}>No feedback found.</div>
      ) : (
        <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={{ padding: 8 }}>Date</th>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Feedback</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.map(fb => (
              <tr key={fb.id}>
                <td style={{ padding: 8 }}>{new Date(fb.created_at).toLocaleString()}</td>
                <td style={{ padding: 8 }}>{fb.name}</td>
                <td style={{ padding: 8 }}>{fb.email}</td>
                <td style={{ padding: 8 }}>{fb.message}</td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() => handleDelete(fb.id)}
                    disabled={deletingId === fb.id}
                    style={{
                      background: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 16px',
                      fontWeight: 600,
                      cursor: deletingId === fb.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {deletingId === fb.id ? 'Deleting...' : 'Delete'}
                  </button>
                  {confirmDeleteId === fb.id && (
                    <div style={{
                      position: 'fixed',
                      top: 0, left: 0, width: '100vw', height: '100vh',
                      background: 'rgba(0,0,0,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 2000
                    }}>
                      <div style={{
                        background: '#fff',
                        borderRadius: 10,
                        padding: 32,
                        boxShadow: '0 4px 24px #0002',
                        minWidth: 320,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
                          Are you sure you want to delete this feedback?
                        </div>
                        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                          <button
                            style={{
                              background: '#e74c3c',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 24px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            onClick={() => confirmDelete(fb.id)}
                          >
                            Delete
                          </button>
                          <button
                            style={{
                              background: '#e3f2fd',
                              color: '#3498db',
                              border: 'none',
                              borderRadius: 8,
                              padding: '8px 24px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}