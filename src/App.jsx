<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import Navbar from './components/Navbar';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './components/Home';
import RecipeSearch from './components/RecipeSearch';
import RecipeDetails from './components/RecipeDetails';
import MyRecipes from './components/MyRecipes';
import RecipeForm from './components/RecipeForm';
import Favorites from './components/Favorites';
import './App.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app">
        {session && <Navbar />}
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                session ? (
                  <Home />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/search"
              element={
                session ? (
                  <RecipeSearch />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/recipe/:id"
              element={
                session ? (
                  <RecipeDetails />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/my-recipes"
              element={
                session ? (
                  <MyRecipes />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/my-recipes/new"
              element={
                session ? (
                  <RecipeForm />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/my-recipes/edit/:id"
              element={
                session ? (
                  <RecipeForm />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/favorites"
              element={
                session ? (
                  <Favorites />
                ) : (
                  <Navigate to="/signin" replace />
                )
              }
            />
            <Route
              path="/signin"
              element={
                !session ? (
                  <SignIn />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/signup"
              element={
                !session ? (
                  <SignUp />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './components/Home';
import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </div>
>>>>>>> 1f10736925bcf75d717938419800fc0e885342a9
  );
}

export default App;
