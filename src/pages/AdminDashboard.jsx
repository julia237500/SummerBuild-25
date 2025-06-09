import { useNavigate } from 'react-router-dom';

const tools = [
  { name: 'Reset/Delete All Recipes', route: '/admin/reset', icon: '🗑️' },
  { name: 'View/Edit/Delete Recipes', route: '/admin/manage', icon: '📋' },
  { name: 'Upload Tester', route: '/admin/upload-test', icon: '📤' },
  { name: 'Error Simulator', route: '/admin/error-sim', icon: '⚠️' },
  { name: 'Form Pre-fill Tester', route: '/create?test=1', icon: '🧪' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <h2>Admin Dashboard</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 30 }}>
        {tools.map(tool => (
          <div
            key={tool.name}
            style={{
              flex: '1 1 220px',
              minWidth: 220,
              background: '#f9f9f9',
              borderRadius: 8,
              boxShadow: '0 2px 8px #0001',
              padding: 24,
              cursor: 'pointer',
              textAlign: 'center'
            }}
            onClick={() => navigate(tool.route)}
          >
            <div style={{ fontSize: 36 }}>{tool.icon}</div>
            <div style={{ marginTop: 12, fontWeight: 500 }}>{tool.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
