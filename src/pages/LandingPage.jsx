import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "admin",
      icon: "🛡️",
      title: "Admin Panel",
      desc: "Manage users, products, and platform settings",
      color: "green",
      path: "/login?role=admin",
    },
    {
      id: "seller",
      icon: "🏪",
      title: "Seller Dashboard",
      desc: "List your products and manage your campus store",
      color: "orange",
      path: "/login?role=seller",
    },
    {
      id: "buyer",
      icon: "🛒",
      title: "Shop Now",
      desc: "Browse and buy products from campus sellers",
      color: "blue",
      path: "/login?role=buyer",
    },
  ];

  return (
    <div className="landing-page">
      <div className="landing-blob blob-1" />
      <div className="landing-blob blob-2" />
      <div className="landing-blob blob-3" />

      <div className="landing-inner">

        {/* Logo */}
        <div className="landing-logo">
          <span className="landing-logo-icon">🎒</span>
          <span className="landing-logo-text">Campus<em>Cart</em></span>
        </div>

        {/* Heading */}
        <div className="landing-heading">
          <h1>Welcome to <span>CampusCart</span></h1>
          <p>Choose your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="landing-cards">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`landing-card lc-${role.color}`}
              onClick={() => navigate(role.path)}
            >
              <div className={`lc-icon-wrap lc-icon-${role.color}`}>
                <span className="lc-icon">{role.icon}</span>
              </div>
              <h3 className="lc-title">{role.title}</h3>
              <p className="lc-desc">{role.desc}</p>
              <div className="lc-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="landing-footer-text">
          Already have an account?{" "}
          <button className="landing-login-link" onClick={() => navigate("/login")}>
            Sign in directly →
          </button>
        </p>
      </div>
    </div>
  );
}