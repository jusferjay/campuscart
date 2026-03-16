import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar({ cart = [], user, onLogout }) {
  const cartCount = cart?.length || 0;
  const location = useLocation();

  const navLinks = [
    { to: "/dashboard", label: "Store" },
    { to: "/profile", label: "Profile" },
    { to: "/settings", label: "Settings" },
  ];

  const authLinks = [
    { to: "/", label: "Login" },
    { to: "/register", label: "Register" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="logo">
          <span className="logo-icon">🎒</span>
          <span className="logo-text">Campus<em>Cart</em></span>
        </Link>

        <div className="nav-center">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <div className="user-info">
                <span className="user-name">
                  {user.first_name} {user.last_name}
                </span>
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            authLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`auth-link ${location.pathname === to ? "active" : ""}`}
              >
                {label}
              </Link>
            ))
          )}

          <Link to="/cart" className="cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;