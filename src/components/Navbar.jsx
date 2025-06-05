import React from 'react';
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