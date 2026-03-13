import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import './Login.css'

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (authError) throw authError

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      if (!profile.is_active) {
        await supabase.auth.signOut()
        throw new Error('Your account has been deactivated. Please contact support.')
      }

      // Pass role up to App.jsx — it handles the redirect
      if (onLogin) onLogin(profile.role)

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="left-logo">
          <span className="brand-icon">🛒</span>
          <span className="brand-name">Campus<em>Cart</em></span>
        </div>

        <div className="left-hero">
          <h1>
            Your campus.<br />
            Your <span>marketplace.</span>
          </h1>
          <p>
            Buy, sell, and trade with students on your campus.
            From textbooks to electronics — everything in one place.
          </p>
          <div className="left-stats">
            <div className="stat">
              <span className="stat-num"><em>500+</em></span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat">
              <span className="stat-num"><em>1.2k</em></span>
              <span className="stat-label">Listings</span>
            </div>
            <div className="stat">
              <span className="stat-num"><em>98%</em></span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Floating card */}
        <div className="float-card">
          <div className="float-card-label">Top Categories</div>
          <div className="float-card-item">
            <span className="dot green" />
            Books &amp; Notes
          </div>
          <div className="float-card-item">
            <span className="dot orange" />
            Electronics
          </div>
          <div className="float-card-item">
            <span className="dot blue" />
            Clothing
          </div>
        </div>

        <div className="left-footer">© 2025 CampusCart. All rights reserved.</div>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleLogin}>

            {/* Email */}
            <div className="field-group">
              <div className="label-row">
                <label className="field-label">Email Address</label>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  className="login-input"
                  type="email"
                  name="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <div className="label-row">
                <label className="field-label">Password</label>
                <button type="button" className="forgot-link">Forgot password?</button>
              </div>
              <div className="input-wrap">
                <span className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className="login-input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Role info */}
            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">redirects by role automatically</span>
              <span className="divider-line" />
            </div>

            {/* Submit */}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="login-footer">
            Don't have an account?{' '}
            <Link to="/register" className="register-link">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}