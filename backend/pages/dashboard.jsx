import { useNavigate } from 'react-router-dom';

const tools = [
  { name: 'Delete All Recipes', route: '/admin/reset', icon: '🗑️' },
  { name: 'View/Edit/Delete Recipes', route: '/admin/manage', icon: '📋' },
  { name: 'Upload Tester', route: '/admin/upload-test', icon: '📤' },
  { name: 'Error Simulator', route: '/admin/error-sim', icon: '⚠️' },
  { name: 'Form Pre-fill Tester', route: '/create?test=1', icon: '🧪' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h2>Admin Dashboard</h2>
      <div className="row mt-4">
        {tools.map(tool => (
          <div key={tool.name} className="col-md-4 mb-3">
            <div className="card shadow-sm p-3" onClick={() => navigate(tool.route)} style={{ cursor: 'pointer' }}>
              <h4>{tool.icon} {tool.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
