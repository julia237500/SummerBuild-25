import { useEffect, useState } from 'react';
import supabase from '../services/supabaseClient';

const DASHBOARD_SHORTCUTS = [
  { key: 'users', label: 'Users', icon: '👥', color: '#3498db' },
  { key: 'recipes', label: 'Recipes', icon: '🍲', color: '#2ecc71' },
  { key: 'revenue', label: 'Revenue', icon: '💰', color: '#ff9800' },
  { key: 'admin', label: 'Admin Profile', icon: '👤', color: '#607d8b' }
];

export default function DashboardPage({ onNavigate, setActivePage }) {
  const [userStats, setUserStats] = useState({ total: 0, newThisWeek: 0 });
  const [recipesCount, setRecipesCount] = useState(0);
  const [revenueStats, setRevenueStats] = useState({ total: 0, daily: [], plans: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      // Fetch users
      const { data: usersData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      // User stats
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const newThisWeek = usersData?.filter(u => new Date(u.created_at) >= weekAgo).length || 0;
      // Recipes count
      const { count: recipesCount } = await supabase.from('recipes').select('id', { count: 'exact', head: true });
      // Revenue stats (simulate or fetch from your backend)
      let revenueStats = { total: 0, daily: [], plans: {} };
      try {
        const res = await fetch('/api/revenue/summary');
        if (res.ok) revenueStats = await res.json();
      } catch {}
      setUserStats({ total: usersData?.length || 0, newThisWeek });
      setRecipesCount(recipesCount || 0);
      setRevenueStats(revenueStats);
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  // Use setActivePage from props to link shortcut buttons to sidebar navigation
  function handleShortcut(key) {
    if (typeof setActivePage === 'function') {
      setActivePage(key);
    } else if (typeof onNavigate === 'function') {
      onNavigate(key);
    } else {
      window.location.hash = `#${key}`;
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Admin Overview</h1>
      <div style={{ display: 'flex', gap: 32, marginBottom: 40, flexWrap: 'wrap' }}>
        <div style={{ background: '#3498db', color: '#fff', borderRadius: 16, minWidth: 180, flex: '1 1 180px', padding: '24px 32px' }}>
          <div style={{ fontSize: 16 }}>Total Users</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{loading ? '...' : userStats.total}</div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>+{loading ? '...' : userStats.newThisWeek} new this week</div>
        </div>
        <div style={{ background: '#2ecc71', color: '#fff', borderRadius: 16, minWidth: 180, flex: '1 1 180px', padding: '24px 32px' }}>
          <div style={{ fontSize: 16 }}>Total Recipes</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{loading ? '...' : recipesCount}</div>
        </div>
        <div style={{ background: '#ff9800', color: '#fff', borderRadius: 16, minWidth: 180, flex: '1 1 180px', padding: '24px 32px' }}>
          <div style={{ fontSize: 16 }}>Total Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>${loading ? '...' : revenueStats.total}</div>
        </div>
        <div style={{ background: '#9b59b6', color: '#fff', borderRadius: 16, minWidth: 180, flex: '1 1 180px', padding: '24px 32px' }}>
          <div style={{ fontSize: 16 }}>Most Popular Plan</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{loading ? '...' : (revenueStats.plans?.mostPopular || 'N/A')}</div>
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 24,
        marginTop: 24
      }}>
        {DASHBOARD_SHORTCUTS.map(item => (
          <div
            key={item.key}
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 8px #0001',
              padding: 32,
              cursor: 'pointer',
              textAlign: 'center',
              borderTop: `4px solid ${item.color}`,
              transition: 'box-shadow 0.2s, transform 0.2s'
            }}
            onClick={() => handleShortcut(item.key)}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') handleShortcut(item.key); }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#222c36' }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
