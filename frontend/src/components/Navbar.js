// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ cartCount, user, handleLogout }) {
  return (
    <nav className="navbar">

      {/* ── Brand ── */}
      <Link to="/" className="navbar__brand-link">
        i<span>Health</span>
      </Link>

      {/* ── Nav Links ── */}
      <div className="navbar__nav-group">
        <Link to="/" className="nav-link">Home</Link>

        {/* Cart icon with badge */}
        <Link to="/cart" className="nav-link nav-link--cart">
          <svg
            className="cart-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        {user ? (
          <>
            {user.is_staff && (
              <Link to="/owner" className="nav-link nav-link--owner">Owner Dashboard</Link>
            )}
            <Link to="/profile" className="nav-link">My Profile</Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </div>

    </nav>
  );
}

export default Navbar;