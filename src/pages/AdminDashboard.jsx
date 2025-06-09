import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';

const tools = [
  { name: 'Reset/Delete All Recipes', route: '/admin/reset', icon: '🗑️', color: '#3498db' },
  { name: 'View/Edit/Delete Recipes', route: '/admin/manage', icon: '📋', color: '#2ecc71' },
  { name: 'Upload Tester', route: '/admin/upload-test', icon: '📤', color: '#f39c12' },
  { name: 'Error Simulator', route: '/admin/error-sim', icon: '⚠️', color: '#e74c3c' },
  { name: 'Form Pre-fill Tester', route: '/create?test=1', icon: '🧪', color: '#9b59b6' }
];

const SIDEBAR_ITEMS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'recipes', label: 'View All Recipes', icon: '📖' },
  { key: 'revenue', label: 'Revenue', icon: '💰' },
  { key: 'profile', label: 'Admin Profile', icon: '👤' }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('home');
  const [stats, setStats] = useState({
    recipes: null,
    users: null,
    pageViews: 0 // Changed from reports to pageViews
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Count recipes
        const { count: recipeCount, error: recipeError } = await supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true });
        // Count users (profiles)
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        // Simulate page views (replace with real analytics if available)
        const pageViews = Math.floor(1000 + Math.random() * 9000);

        setStats({
          recipes: recipeError ? null : recipeCount,
          users: userError ? null : userCount,
          pageViews // Use simulated or real value
        });
      } catch (err) {
        setStats({ recipes: null, users: null, pageViews: 0 });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Sidebar button click handler
  const handleSidebarClick = (key) => {
    setActivePage(key);
  };

  // Helper for summary cards
  const summaryStats = [
    { label: 'Recipes', value: loadingStats ? '...' : (stats.recipes ?? 'N/A'), icon: '🍲', color: '#3498db' },
    { label: 'Users', value: loadingStats ? '...' : (stats.users ?? 'N/A'), icon: '👤', color: '#2ecc71' },
    { label: 'Page Views', value: loadingStats ? '...' : (stats.pageViews ?? 'N/A'), icon: '👁️', color: '#e74c3c' }
  ];

  // Home Page Content
  const renderHome = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 500,
      background: 'linear-gradient(120deg, #4CAF50 0%, #81c784 100%)',
      borderRadius: 24,
      boxShadow: '0 4px 24px #0002',
      padding: 48,
      color: '#fff',
      position: 'relative'
    }}>
      <img
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80"
        alt="RecipeHub Logo"
        style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          marginBottom: 24,
          objectFit: 'cover',
          boxShadow: '0 2px 12px #0003',
          border: '4px solid #fff'
        }}
      />
      <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16, letterSpacing: 1 }}>
        Welcome to <span style={{ color: '#ffd600' }}>Admin Home Page</span>
      </h1>
      <p style={{
        fontSize: 20,
        maxWidth: 600,
        textAlign: 'center',
        marginBottom: 32,
        opacity: 0.95
      }}>
        Manage your RecipeHub platform with ease.<br />
        Use the dashboard to monitor recipes, users, and reports, or explore more admin features using the sidebar.
      </p>
      <div style={{
        display: 'flex',
        gap: 32,
        marginTop: 24,
        flexWrap: 'wrap'
      }}>
        {summaryStats.map(stat => (
          <div key={stat.label}
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              borderRadius: 16,
              minWidth: 180,
              flex: '1 1 180px',
              display: 'flex',
              alignItems: 'center',
              padding: '24px 32px',
              boxShadow: '0 2px 8px #0001',
              border: `2px solid ${stat.color}`
            }}>
            <span style={{
              fontSize: 36,
              marginRight: 18,
              opacity: 0.85
            }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Dashboard Page Content
  const renderDashboard = () => (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#222c36', marginBottom: 32 }}>
        Admin Dashboard
      </h1>
      <div style={{
        display: 'flex',
        gap: 24,
        marginBottom: 40,
        flexWrap: 'wrap'
      }}>
        {summaryStats.map(stat => (
          <div key={stat.label}
            style={{
              background: stat.color,
              color: '#fff',
              borderRadius: 12,
              minWidth: 200,
              flex: '1 1 200px',
              display: 'flex',
              alignItems: 'center',
              padding: '24px 32px',
              boxShadow: '0 2px 8px #0001'
            }}>
            <span style={{
              fontSize: 36,
              marginRight: 18,
              opacity: 0.85
            }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>{stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 24
      }}>
        {tools.map(tool => (
          <div
            key={tool.name}
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 8px #0001',
              padding: 32,
              cursor: 'pointer',
              textAlign: 'center',
              borderTop: `4px solid ${tool.color}`,
              transition: 'box-shadow 0.2s, transform 0.2s'
            }}
            onClick={() => navigate(tool.route)}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') navigate(tool.route); }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>{tool.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#222c36' }}>{tool.name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Placeholder for other pages
  const renderPlaceholder = (label) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 400,
      fontSize: 28,
      color: '#888'
    }}>
      {label} page coming soon.
    </div>
  );

  // Main render
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        background: '#f4f6fa',
        overflow: 'hidden'
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
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
        }}
      >
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
        <nav style={{ width: '100%' }}>
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
                  onClick={() => handleSidebarClick(item.key)}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: '40px 32px',
          minHeight: '100vh',
          height: '100vh',
          marginLeft: 240,
          overflowY: 'auto',
          background: '#f4f6fa'
        }}
      >
        {activePage === 'home' && renderHome()}
        {activePage === 'dashboard' && renderDashboard()}
        {activePage === 'recipes' && renderPlaceholder('View All Recipes')}
        {activePage === 'revenue' && renderPlaceholder('Revenue')}
        {activePage === 'profile' && renderPlaceholder('Admin Profile')}
      </main>
    </div>
  );
}
