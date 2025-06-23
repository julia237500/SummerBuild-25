import { BrowserRouter as Router } from 'react-router-dom';
import { useState, useEffect } from 'react';
import supabase from './services/supabaseClient';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import './App.css';
import Chatbot from './components/Chatbot';


function App() {
  console.log('App component rendering');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log('Setting up auth listener');

      // Get initial session
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          console.log('Initial session:', session);
          setSession(session);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error getting session:', err);
          setError(err.message);
          setLoading(false);
        });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state changed:', session);
        setSession(session);
        setLoading(false);
      });

      return () => {
        console.log('Cleaning up auth listener');
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Error in auth setup:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Helper: check if current route is admin
  const isAdminRoute = () => {
    // Use window.location.pathname since AppRoutes is rendered inside Router
    const path = window.location.pathname;
    return (
      path.startsWith('/admin') ||
      path === '/admin' ||
      path === '/admin/login' ||
      path === '/admin/dashboard'
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {/* Only show Navbar if NOT on admin pages */}
        {!isAdminRoute() && session && <Navbar />}
        <main className="main-content">
          <AppRoutes />
        </main>
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
