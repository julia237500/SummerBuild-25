import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [recipeDropdown, setRecipeDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const navbarRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        closeDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setShowServiceDropdown(false);
  }, [location.pathname]);

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

  const toggleRecipeDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setRecipeDropdown(!recipeDropdown);
    setProfileDropdown(false);
  };

  const toggleProfileDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setProfileDropdown(!profileDropdown);
    setRecipeDropdown(false);
  };

  const closeDropdowns = () => {
    setRecipeDropdown(false);
    setProfileDropdown(false);
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeDropdowns}>
          Recipe<span>Hub</span>
        </Link>

        <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeDropdowns}>HOME</Link>
          <div className="dropdown">
            <button className="nav-link dropdown-toggle" onClick={toggleRecipeDropdown}>
              RECIPE
              <span className={`arrow ${recipeDropdown ? 'up' : 'down'}`}></span>
            </button>
            {recipeDropdown && (
              <div className="dropdown-menu">
                <Link to="/search" className="dropdown-item" onClick={closeDropdowns}>Search Recipes</Link>
                <Link to="/my-recipes" className="dropdown-item" onClick={closeDropdowns}>My Recipes</Link>
              </div>
            )}
          </div>
          <div className="dropdown">
            <button className="nav-link dropdown-toggle" onClick={toggleProfileDropdown}>
              PROFILE
              <span className={`arrow ${profileDropdown ? 'up' : 'down'}`}></span>
            </button>
            {profileDropdown && (
              <div className="dropdown-menu">
                <Link to="/favorites" className="dropdown-item" onClick={closeDropdowns}>Favorites</Link>
                <Link to="/profile" className="dropdown-item" onClick={closeDropdowns}>My Profile</Link>
              </div>
            )}
          </div>
          <div
            className="dropdown"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            tabIndex={0}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setShowDropdown(false)}
          >
            <button className="dropdown-toggle" aria-haspopup="true" aria-expanded={showDropdown}>
              PLANNER
              <span className={`arrow ${showDropdown ? 'up' : 'down'}`}></span>
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/meal-planner" className="dropdown-item">
                  Meal Planner
                </Link>
                {/* Add more planner-related links here if needed */}
              </div>
            )}
          </div>
  
          <Link to="/subscription" className="nav-link premium-link" onClick={closeDropdowns}>
            SUBSCRIPTION
            <span className="premium-badge">PRO</span>
          </Link>
          <Link to="/blog" className="nav-link" onClick={closeDropdowns}>BLOG</Link>
          <Link to="/contact" className="nav-link" onClick={closeDropdowns}>CONTACT</Link>
        </div>

        <button className="hamburger" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <button onClick={() => {
          closeDropdowns();
          handleSignOut();
        }} className="sign-out-btn">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
    <nav>
      <div>
        <button>
          Sign Out
        </button>
      </div>
    </nav>
