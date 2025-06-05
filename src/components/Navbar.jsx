<<<<<<< HEAD
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Recipe App
        </Link>
        <button
          className={`hamburger ${isOpen ? 'active' : ''}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>
          Home
        </Link>
        <Link to="/search" className="nav-link" onClick={() => setIsOpen(false)}>
          Search
        </Link>
        <Link to="/my-recipes" className="nav-link" onClick={() => setIsOpen(false)}>
          My Recipes
        </Link>
        <Link to="/favorites" className="nav-link" onClick={() => setIsOpen(false)}>
          Favorites
        </Link>
        <button onClick={handleSignOut} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    </nav>
  );
} 
=======
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link> |{' '}
      <Link to="/signin">Sign In</Link> |{' '}
      <Link to="/signup">Sign Up</Link>
    </nav>
  );
}

export default Navbar;
>>>>>>> 1f10736925bcf75d717938419800fc0e885342a9
