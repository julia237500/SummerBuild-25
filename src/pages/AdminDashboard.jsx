import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import OverviewPage from './OverviewPage';
import UsersPage from './UsersPage';
import RecipesPage from './RecipesPage';
import RevenuePage from './RevenuePage';
import AdminProfilePage from './AdminProfilePage';
import DashboardPage from './DashboardPage'; // Import DashboardPage

const SIDEBAR_ITEMS = [
  { key: 'overview', label: 'Overview', icon: '🏠' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'recipes', label: 'Recipes', icon: '🍲' },
  { key: 'revenue', label: 'Revenue', icon: '💰' },
  { key: 'admin', label: 'Admin Profile', icon: '👤' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('overview');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#222c36',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 32,
        boxShadow: '2px 0 8px #0001',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 10
      }}>
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
          alt="RecipeHub Logo"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            marginBottom: 12,
            objectFit: 'cover',
            boxShadow: '0 2px 8px #0003'
          }}
        />
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 32,
          letterSpacing: 1,
          color: '#fff'
        }}>
          Recipe<span style={{ color: '#4CAF50' }}>Hub</span>
        </h2>
        <nav style={{ width: '100%', flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, width: '100%' }}>
            {SIDEBAR_ITEMS.map(item => (
              <li key={item.key}>
                <button
                  style={{
                    width: '100%',
                    background: activePage === item.key ? '#4CAF50' : 'none',
                    border: 'none',
                    color: '#fff',
                    textAlign: 'left',
                    padding: '12px 32px',
                    fontSize: 16,
                    cursor: 'pointer',
                    fontWeight: activePage === item.key ? 700 : 400,
                    borderLeft: activePage === item.key ? '4px solid #ffd600' : '4px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'background 0.2s'
                  }}
                  onClick={() => setActivePage(item.key)}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={() => navigate('/admin/login')}
          style={{
            width: '80%',
            margin: '24px 0 16px 0',
            padding: '12px 0',
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: '40px 32px',
          minHeight: '100vh',
          marginLeft: 240,
          overflowY: 'auto',
          background: '#f4f6fa'
        }}
      >
        {activePage === 'overview' && <OverviewPage />}
        {activePage === 'dashboard' && (
          <DashboardPage setActivePage={setActivePage} />
        )}
        {activePage === 'users' && <UsersPage />}
        {activePage === 'recipes' && <RecipesPage />}
        {activePage === 'revenue' && <RevenuePage />}
        {activePage === 'admin' && <AdminProfilePage />}
      </main>
    </div>
  );
}
