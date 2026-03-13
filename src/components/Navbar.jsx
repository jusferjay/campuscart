import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Navbar.css";

function Navbar({ cart = [] }) {
  const cartCount = cart?.length || 0;
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile();
    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getProfile();
    });
    return () => subscription.unsubscribe();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setProfile(null);
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate("/");
  };

  // Links per role
  const navLinks = {
    admin: [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/users", label: "Users" },
      { to: "/admin/products", label: "Products" },
    ],
    seller: [
      { to: "/seller", label: "My Store" },
      { to: "/seller/upload", label: "Add Product" },
      { to: "/profile", label: "Profile" },
    ],
    buyer: [
      { to: "/dashboard", label: "Store" },
      { to: "/profile", label: "Profile" },
      { to: "/settings", label: "Settings" },
    ],
  };

  const links = profile ? (navLinks[profile.role] || navLinks.buyer) : navLinks.buyer;
  const initials = profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={profile?.role === "admin" ? "/admin" : profile?.role === "seller" ? "/seller" : "/dashboard"} className="logo">
          <span className="logo-icon">🎒</span>
          <span className="logo-text">Campus<em>Cart</em></span>
        </Link>

        {/* Center nav links */}
        <div className="nav-center">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${location.pathname === to ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="nav-right">
          {profile ? (
            <>
              {/* Role badge */}
              <span className={`role-badge role-${profile.role}`}>
                {profile.role === "admin" ? "🛡️" : profile.role === "seller" ? "🏪" : "🧑‍🎓"} {profile.role}
              </span>

              {/* Avatar */}
              <div className={`nav-avatar avatar-${profile.role}`}>
                {initials}
              </div>

              {/* Cart — only for buyers */}
              {profile.role === "buyer" && (
                <Link to="/cart" className="cart-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              )}

              {/* Logout */}
              <button className="logout-btn" onClick={handleLogout}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className={`auth-link ${location.pathname === "/" ? "active" : ""}`}>Login</Link>
              <Link to="/register" className={`auth-link ${location.pathname === "/register" ? "active" : ""}`}>Register</Link>
              <Link to="/cart" className="cart-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;