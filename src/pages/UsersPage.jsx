import { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

function UserGrowthChart({ data }) {
  if (!data || data.length === 0) return <div style={{ color: '#888', margin: 24 }}>No data</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const width = 900, height = 340, pad = 60;
  const points = data.map((d, i) => [
    pad + (i * (width - 2 * pad)) / (data.length - 1),
    height - pad - ((d.count / max) * (height - 2 * pad))
  ]);
  return (
    <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 24 }}>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto', background: '#f9f9f9', borderRadius: 8 }}>
        {/* Axes */}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#bbb" strokeWidth="2" />
        {/* Axis labels */}
        <text x={width / 2} y={height - 15} fontSize="16" textAnchor="middle" fill="#444">Date</text>
        <text x={pad - 40} y={height / 2} fontSize="16" textAnchor="middle" fill="#444" transform={`rotate(-90,${pad - 40},${height / 2})`}>Number of Users</text>
        {/* Data line */}
        <polyline
          fill="none"
          stroke="#3498db"
          strokeWidth="3"
          points={points.map(p => p.join(',')).join(' ')}
        />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={5} fill="#3498db" />
        ))}
        {/* X axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={points[i][0]}
            y={height - pad + 20}
            fontSize="12"
            textAnchor="middle"
            fill="#888"
            style={{ pointerEvents: 'none' }}
          >
            {d.label}
          </text>
        ))}
        {/* Y axis labels (0 and max) */}
        <text x={pad - 10} y={pad + 5} fontSize="12" textAnchor="end" fill="#888">{max}</text>
        <text x={pad - 10} y={height - pad + 5} fontSize="12" textAnchor="end" fill="#888">0</text>
      </svg>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [growthDuration, setGrowthDuration] = useState(7);
  const [userGrowth, setUserGrowth] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', full_name: '' });
  const [editMsg, setEditMsg] = useState('');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [deleteAllMsg, setDeleteAllMsg] = useState('');

  // Fetch users with pagination and search
  useEffect(() => {
    let query = supabase.from('profiles').select('*', { count: 'exact' });
    if (search) {
      if (searchBy === 'name') {
        query = query.ilike('full_name', `%${search}%`);
      } else if (searchBy === 'email') {
        query = query.ilike('email', `%${search}%`);
      } else if (searchBy === 'signup') {
        // For signup date, match YYYY-MM-DD
        query = query.ilike('created_at', `%${search}%`);
      }
    }
    query = query.order('created_at', { ascending: false }).range(page * 10, page * 10 + 9);
    setLoading(true);
    query.then(({ data, count }) => {
      setUsers(data || []);
      setTotal(count || 0);
      setLoading(false);
    });
  }, [search, searchBy, page]);

  // Fetch user growth for selected duration
  useEffect(() => {
    supabase.from('profiles').select('created_at').then(({ data }) => {
      if (!data) return setUserGrowth([]);
      const days = growthDuration === 'all' ? Math.ceil((Date.now() - new Date(data[data.length - 1]?.created_at || Date.now())) / 86400000) : growthDuration;
      const today = new Date();
      const growth = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const label = `${d.getMonth() + 1}/${d.getDate()}`;
        const count = data.filter(u => {
          const created = new Date(u.created_at);
          return (
            created.getFullYear() === d.getFullYear() &&
            created.getMonth() === d.getMonth() &&
            created.getDate() === d.getDate()
          );
        }).length;
        growth.push({ label, count });
      }
      setUserGrowth(growth);
    });
  }, [growthDuration]);

  // Edit user handlers
  const handleEditUser = (user) => {
    setEditUser(user);
    setEditForm({ email: user.email, full_name: user.full_name || '' });
    setEditMsg('');
  };
  const handleEditFormChange = (e) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleEditSave = async () => {
    setEditMsg('');
    if (!editForm.email || !editForm.full_name) {
      setEditMsg('Email and Name are required');
      return;
    }
    // Only allow updating email and full_name
    const { error } = await supabase
      .from('profiles')
      .update({ email: editForm.email, full_name: editForm.full_name })
      .eq('id', editUser.id);
    if (error) {
      setEditMsg('Failed to update user');
    } else {
      setUsers(users =>
        users.map(u =>
          u.id === editUser.id ? { ...u, email: editForm.email, full_name: editForm.full_name } : u
        )
      );
      setEditUser(null);
    }
  };

  // Delete user handler
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeleteUserId(id);
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      setUsers(users => users.filter(u => u.id !== id));
      setTotal(t => t - 1);
    }
    setDeleteUserId(null);
  };

  // Delete all users handler
  const handleDeleteAllUsers = async () => {
    setDeleteAllLoading(true);
    setDeleteAllMsg('');
    const { error } = await supabase.from('profiles').delete().neq('id', ''); // delete all
    if (!error) {
      setUsers([]);
      setTotal(0);
      setDeleteAllMsg('All users deleted.');
    } else {
      setDeleteAllMsg('Failed to delete all users.');
    }
    setDeleteAllLoading(false);
    setShowDeleteAll(false);
  };

  // User Counter (total, new this week)
  const userCounter = (() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const newThisWeek = users.filter(u => new Date(u.created_at) >= weekAgo).length;
    return { total, newThisWeek };
  })();

  return (
    <div style={{ minHeight: '100vh', marginTop: 0, paddingTop: 0 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, marginTop: 0 }}>Users</h1>
      {/* User Counter */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
        <div style={{ background: '#3498db', color: '#fff', borderRadius: 12, minWidth: 180, padding: '16px 32px' }}>
          <div style={{ fontSize: 16 }}>Total Users</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{userCounter.total}</div>
        </div>
        <div style={{ background: '#2ecc71', color: '#fff', borderRadius: 12, minWidth: 180, padding: '16px 32px' }}>
          <div style={{ fontSize: 16 }}>New Users This Week</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{userCounter.newThisWeek}</div>
        </div>
      </div>
      {/* Delete All Users Button */}
      <div style={{ marginBottom: 16 }}>
        <button
          style={{
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0001'
          }}
          onClick={() => setShowDeleteAll(true)}
          disabled={deleteAllLoading || users.length === 0}
        >
          Delete All Users
        </button>
        {deleteAllMsg && (
          <span style={{ marginLeft: 16, color: deleteAllMsg.includes('deleted') ? '#2ecc71' : '#e74c3c', fontWeight: 600 }}>
            {deleteAllMsg}
          </span>
        )}
      </div>
      {/* Confirm Delete All Modal */}
      {showDeleteAll && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 8px #0002', textAlign: 'center' }}>
            <h3 style={{ marginBottom: 16, color: '#e74c3c' }}>Are you sure you want to delete ALL users?</h3>
            <div style={{ marginBottom: 24, color: '#888' }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={handleDeleteAllUsers}
                style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                disabled={deleteAllLoading}
              >
                {deleteAllLoading ? 'Deleting...' : 'Yes, Delete All'}
              </button>
              <button
                onClick={() => setShowDeleteAll(false)}
                style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                disabled={deleteAllLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Search */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ fontWeight: 500 }}>Search by:</label>
        <select
          value={searchBy}
          onChange={e => { setSearchBy(e.target.value); setSearch(''); setPage(0); }}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="signup">Signup Date</option>
        </select>
        <input
          type={searchBy === 'signup' ? 'date' : 'text'}
          placeholder={
            searchBy === 'name'
              ? 'Enter name'
              : searchBy === 'email'
              ? 'Enter email'
              : 'YYYY-MM-DD'
          }
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 220 }}
        />
      </div>
      {/* User Table */}
      <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Email</th>
            <th style={{ padding: 8 }}>Signup Date</th>
            <th style={{ padding: 8 }}>Subscription</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24 }}>Loading...</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No users found.</td></tr>
          ) : (
            users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: 8 }}>{user.full_name || '-'}</td>
                <td style={{ padding: 8 }}>{user.email}</td>
                <td style={{ padding: 8 }}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{user.subscription_status || 'Free'}</td>
                <td style={{ padding: 8 }}>
                  <button
                    style={{ marginRight: 8, background: '#607d8b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => handleEditUser(user)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: deleteUserId === user.id ? 'not-allowed' : 'pointer' }}
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deleteUserId === user.id}
                  >
                    {deleteUserId === user.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          Showing {page * 10 + 1}-{Math.min((page + 1) * 10, total)} of {total} users
        </div>
        <div>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ marginRight: 8, padding: '6px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => (p + 1) * 10 < total ? p + 1 : p)}
            disabled={(page + 1) * 10 >= total}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #ccc', background: '#fff', cursor: (page + 1) * 10 >= total ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>
      {/* Edit User Modal */}
      {editUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 2px 8px #0002' }}>
            <h3>Edit User</h3>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleEditFormChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
            />
            <label>Name</label>
            <input
              type="text"
              name="full_name"
              value={editForm.full_name}
              onChange={handleEditFormChange}
              style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
            />
            {/* Password reset link (for security, not direct edit) */}
            <div style={{ margin: '12px 0', fontSize: 13, color: '#888' }}>
              To reset password, use the "Forgot password" feature on sign in.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleEditSave} style={{ background: '#4CAF50', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
                Save
              </button>
              <button onClick={() => setEditUser(null)} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
            {editMsg && <div style={{ color: '#e74c3c', marginTop: 12 }}>{editMsg}</div>}
          </div>
        </div>
      )}
      {/* User Growth */}
      <div style={{ marginBottom: 16, fontWeight: 600 }}>User Growth</div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Duration:</label>
        <select
          value={growthDuration}
          onChange={e => setGrowthDuration(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value={7}>Past 7 days</option>
          <option value={30}>Past 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>
      <UserGrowthChart data={userGrowth} />
    </div>
  );
}
