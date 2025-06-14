import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { recipeService } from '../services/recipeService';

const tools = [
  { name: 'Reset/Delete All Recipes', route: '/admin/reset', icon: '🗑️', color: '#3498db' },
  { name: 'View/Edit/Delete Recipes', route: '/admin/manage', icon: '📋', color: '#2ecc71' },
  { name: 'Revenue', route: '/admin/revenue', icon: '💰', color: '#ff9800' }, // added
  { name: 'Admin Profile', route: '/admin/profile', icon: '👤', color: '#607d8b' } // added
];

const SIDEBAR_ITEMS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'recipes', label: 'Recipes', icon: '🛠️' },
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
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin User',
    email: 'admin@abc.com',
    avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80'
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // For demo: store admin password in state (not secure for production)
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  // Password validation function
  const validateAdminPassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&    // at least one uppercase
      /[a-z]/.test(password) &&    // at least one lowercase
      /[^A-Za-z0-9]/.test(password) // at least one special character
    );
  };

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

  // Admin logout handler
  const handleAdminLogout = () => {
    // Optionally clear any admin session state here
    navigate('/admin/login');
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
            onClick={() => {
              // Map tool.route to sidebar key for navigation
              if (tool.route === '/admin/reset') return handleResetAllRecipes();
              if (tool.route === '/admin/manage') return setActivePage('recipes');
              if (tool.route === '/admin/revenue') return setActivePage('revenue');
              if (tool.route === '/admin/profile') return setActivePage('profile');
              // fallback
              navigate(tool.route);
            }}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                // Same as above
                if (tool.route === '/admin/reset') return handleResetAllRecipes();
                if (tool.route === '/admin/manage') return setActivePage('recipes');
                if (tool.route === '/admin/revenue') return setActivePage('revenue');
                if (tool.route === '/admin/profile') return setActivePage('profile');
                navigate(tool.route);
              }
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>{tool.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#222c36' }}>{tool.name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Admin Profile Page Content
  const renderAdminProfile = () => (
    <div style={{
      maxWidth: 500,
      margin: '0 auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 12px #0001',
      padding: 32
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
        <img
          src={adminProfile.avatar}
          alt="Admin Avatar"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid #4CAF50'
          }}
        />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#222c36' }}>{adminProfile.name}</div>
          <div style={{ color: '#666', fontSize: 16 }}>
            Email: <span style={{ fontWeight: 500 }}>{adminProfile.email}</span>
          </div>
          <div style={{ color: '#666', fontSize: 16, marginTop: 8 }}>
            Password:&nbsp;
            <span style={{ fontWeight: 500 }}>
              {showPassword ? adminPassword : '••••••••'}
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                marginLeft: 12,
                background: 'none',
                border: 'none',
                color: '#4CAF50',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
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

  // Add this function to call your backend API to delete all recipes
  const handleResetAllRecipes = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete ALL recipes? This action cannot be undone.'
      )
    ) {
      try {
        // Adjust the API endpoint if needed
        const res = await fetch('/api/admin/recipes/reset', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || 'Failed to delete all recipes.');
        } else {
          alert('All recipes have been deleted.');
          // Optionally refresh stats
          setStats((prev) => ({ ...prev, recipes: 0 }));
        }
      } catch (err) {
        alert('Failed to delete all recipes.');
      }
    }
  };

  // Manage Recipes state
  const [manageRecipes, setManageRecipes] = useState({
    recipes: [],
    loading: false,
    error: null,
    search: '',
    filter: '',
    selectedRecipe: null,
    editForm: null,
    editLoading: false,
    editError: null
  });

  // Fetch all recipes (optionally with filter)
  const fetchAdminRecipes = async (search = '', filter = '') => {
    setManageRecipes(prev => ({ ...prev, loading: true, error: null }));
    try {
      let { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter by search string (name or description)
      if (search) {
        data = data.filter(
          r =>
            (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
            (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
        );
      }
      // Filter by difficulty/cuisine if filter is set
      if (filter) {
        data = data.filter(
          r =>
            (r.difficulty && r.difficulty === filter) ||
            (r.cuisine_type && r.cuisine_type === filter)
        );
      }
      setManageRecipes(prev => ({ ...prev, recipes: data, loading: false }));
    } catch (err) {
      setManageRecipes(prev => ({
        ...prev,
        error: 'Failed to load recipes.',
        loading: false
      }));
    }
  };

  // Load recipes when entering manage page or when search/filter changes
  useEffect(() => {
    if (activePage === 'manage') {
      fetchAdminRecipes(manageRecipes.search, manageRecipes.filter);
    }
    // eslint-disable-next-line
  }, [activePage, manageRecipes.search, manageRecipes.filter]);

  // Handle search/filter input
  const handleManageSearch = (e) => {
    setManageRecipes(prev => ({ ...prev, search: e.target.value }));
  };
  const handleManageFilter = (e) => {
    setManageRecipes(prev => ({ ...prev, filter: e.target.value }));
  };

  // Handle edit/delete actions
  const handleSelectRecipe = (recipe) => {
    setManageRecipes(prev => ({
      ...prev,
      selectedRecipe: recipe,
      editForm: { ...recipe },
      editError: null
    }));
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setManageRecipes(prev => ({
      ...prev,
      editForm: { ...prev.editForm, [name]: value }
    }));
  };
  const handleEditRecipe = async () => {
    setManageRecipes(prev => ({ ...prev, editLoading: true, editError: null }));
    try {
      await recipeService.updateRecipe(manageRecipes.selectedRecipe.id, manageRecipes.editForm);
      setManageRecipes(prev => ({
        ...prev,
        selectedRecipe: null,
        editForm: null,
        editLoading: false
      }));
      fetchAdminRecipes(manageRecipes.search, manageRecipes.filter);
    } catch (err) {
      setManageRecipes(prev => ({
        ...prev,
        editError: 'Failed to update recipe.',
        editLoading: false
      }));
    }
  };
  const handleDeleteRecipe = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    setManageRecipes(prev => ({ ...prev, editLoading: true, editError: null }));
    try {
      await supabase.from('recipes').delete().eq('id', id);
      setManageRecipes(prev => ({
        ...prev,
        selectedRecipe: null,
        editForm: null,
        editLoading: false
      }));
      fetchAdminRecipes(manageRecipes.search, manageRecipes.filter);
    } catch (err) {
      setManageRecipes(prev => ({
        ...prev,
        editError: 'Failed to delete recipe.',
        editLoading: false
      }));
    }
  };

  // Manage Recipes Page Content
  const renderManageRecipes = () => (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #0001', padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Manage Recipes</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by name or description"
          value={manageRecipes.search}
          onChange={handleManageSearch}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <select
          value={manageRecipes.filter}
          onChange={handleManageFilter}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        >
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
          <option value="american">American</option>
          <option value="italian">Italian</option>
          <option value="chinese">Chinese</option>
          <option value="japanese">Japanese</option>
          <option value="mexican">Mexican</option>
          <option value="indian">Indian</option>
          <option value="french">French</option>
          <option value="thai">Thai</option>
          <option value="mediterranean">Mediterranean</option>
          <option value="korean">Korean</option>
          <option value="vietnamese">Vietnamese</option>
          <option value="other">Other</option>
        </select>
      </div>
      {manageRecipes.loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}>Loading recipes...</div>
      ) : manageRecipes.error ? (
        <div style={{ color: '#e74c3c', textAlign: 'center', padding: 32 }}>{manageRecipes.error}</div>
      ) : manageRecipes.selectedRecipe ? (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>Edit Recipe</h2>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={manageRecipes.editForm.name}
                onChange={handleEditFormChange}
                style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <label>Description</label>
              <textarea
                name="description"
                value={manageRecipes.editForm.description}
                onChange={handleEditFormChange}
                style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <label>Difficulty</label>
              <select
                name="difficulty"
                value={manageRecipes.editForm.difficulty}
                onChange={handleEditFormChange}
                style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
              <label>Cuisine Type</label>
              <select
                name="cuisine_type"
                value={manageRecipes.editForm.cuisine_type}
                onChange={handleEditFormChange}
                style={{ width: '100%', padding: 8, marginBottom: 12, borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value="american">American</option>
                <option value="italian">Italian</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
                <option value="french">French</option>
                <option value="thai">Thai</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="korean">Korean</option>
                <option value="vietnamese">Vietnamese</option>
                <option value="other">Other</option>
              </select>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={handleEditRecipe}
                  disabled={manageRecipes.editLoading}
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    cursor: manageRecipes.editLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {manageRecipes.editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setManageRecipes(prev => ({ ...prev, selectedRecipe: null, editForm: null }))
                  }
                  style={{
                    background: '#888',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteRecipe(manageRecipes.selectedRecipe.id)}
                  disabled={manageRecipes.editLoading}
                  style={{
                    background: '#e74c3c',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 24px',
                    fontWeight: 600,
                    cursor: manageRecipes.editLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
              {manageRecipes.editError && (
                <div style={{ color: '#e74c3c', marginTop: 12 }}>{manageRecipes.editError}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr style={{ background: '#f4f6fa' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Difficulty</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Cuisine</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Created</th>
                <th style={{ padding: 8, borderBottom: '1px solid #eee' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {manageRecipes.recipes.map(recipe => (
                <tr key={recipe.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{recipe.name}</td>
                  <td style={{ padding: 8 }}>{recipe.difficulty}</td>
                  <td style={{ padding: 8 }}>{recipe.cuisine_type}</td>
                  <td style={{ padding: 8 }}>{new Date(recipe.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: 8 }}>
                    <button
                      onClick={() => handleSelectRecipe(recipe)}
                      style={{
                        background: '#3498db',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View/Edit
                    </button>
                  </td>
                </tr>
              ))}
              {manageRecipes.recipes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                    No recipes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
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
                  onClick={() => handleSidebarClick(item.key)}
                >
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={handleAdminLogout}
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
          height: '100vh',
          marginLeft: 240,
          overflowY: 'auto',
          background: '#f4f6fa'
        }}
      >
        {activePage === 'home' && renderHome()}
        {activePage === 'dashboard' && renderDashboard()}
        {activePage === 'recipes' && renderManageRecipes()}
        {activePage === 'revenue' && renderPlaceholder('Revenue')}
        {activePage === 'profile' && renderAdminProfile()}
      </main>
    </div>
  );
}
