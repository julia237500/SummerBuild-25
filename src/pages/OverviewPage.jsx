export default function OverviewPage() {
  return (
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
        Welcome to <span style={{ color: '#ffd600' }}>Admin Dashboard</span>
      </h1>
      <p style={{
        fontSize: 20,
        maxWidth: 600,
        textAlign: 'center',
        marginBottom: 32,
        opacity: 0.95
      }}>
        This dashboard lets you monitor user growth, manage users and recipes, track revenue, and analyze your platform’s performance. Use the sidebar or dashboard below to access all admin features.
      </p>
    </div>
  );
}
