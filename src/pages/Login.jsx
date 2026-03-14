import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    // LOGIN USING SUPABASE
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // GET USER PROFILE
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    console.log("User:", data.user);
    console.log("Profile:", profile);

    setLoading(false);

    onLogin?.(profile);
  };

  return (
    <div className="login-page">

      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="left-logo">
          <span className="brand-icon">🎒</span>
          <span className="brand-name">Campus<em>Cart</em></span>
        </div>

        <div className="left-hero">
          <h1>Your campus<br/>store, <span>simplified.</span></h1>
          <p>
            Buy, sell, and discover everything you need for campus life — 
            all in one place, built for students.
          </p>
        </div>

        <p className="left-footer">© 2026 CampusCart. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-glow" />

        <div className="login-card">

          <div className="card-header">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your CampusCart account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="field-group">
              <label className="field-label">Email</label>
              <div className="input-wrap">
                <input
                  className="login-input"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input
                  className="login-input"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              className={`login-btn ${loading ? "loading" : ""}`}
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>

          </form>

          <p className="login-footer">
            Don't have an account?{" "}
            <Link to="/register" className="register-link">
              Create one →
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;