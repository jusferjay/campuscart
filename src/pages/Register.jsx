import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseclient.js";
import "./Register.css";

const COURSES = [
  "BS Computer Science",
  "BS Information Technology",
  "BS Engineering",
  "BS Business Administration",
  "BS Education",
  "BS Nursing",
  "BS Architecture",
  "Other",
];

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#fb923c", "#facc15", "#4ade80"];
  if (!password) return null;
  return (
    <div className="strength-wrap">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="strength-bar"
            style={{ background: i <= score ? colors[score] : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

function Register({ onRegister }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirm: "", course: "", year: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: "" }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim())  e.lastName  = "Last name is required.";
    if (!form.email.includes("@")) e.email  = "Enter a valid email address.";
    if (form.password.length < 8)  e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.course) e.course = "Please select your course.";
    if (!form.year)   e.year   = "Please select your year level.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = (ev) => {
    ev.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);

    try {
      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
          },
        },
      });

      if (signUpError) {
        setErrors({ email: signUpError.message });
        setLoading(false);
        return;
      }

      // 2. Insert profile record
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          role: "Student",
          course: form.course,
          year: form.year,
          joined: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          orders: 0,
          spent: 0,
        });

        if (profileError) {
          console.error("Profile insert error (non-fatal):", profileError);
        }
      }

      setSuccessMsg("Account created! You can now sign in.");
      onRegister?.();
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setErrors({ email: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.confirm && form.password === form.confirm;

  if (successMsg) {
    return (
      <div className="register-page">
        <div className="register-right" style={{ gridColumn: "1/-1" }}>
          <div className="register-card" style={{ alignItems: "center", textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>🎉</div>
            <h2 style={{ color: "#f1f5f9", fontWeight: 800 }}>{successMsg}</h2>
            <p style={{ color: "#475569" }}>Redirecting to login…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">

      {/* LEFT */}
      <div className="register-left">
        <div className="left-logo">
          <span className="brand-icon">🎒</span>
          <span className="brand-name">Campus<em>Cart</em></span>
        </div>
        <div className="left-hero">
          <h1>Join thousands<br/>of <span>students</span><br/>already trading.</h1>
          <p>List your old textbooks, find dorm essentials, and connect with your campus community.</p>
          <div className="left-perks">
            {[
              { icon: "📚", title: "Buy & Sell Textbooks", desc: "Save money every semester" },
              { icon: "🏠", title: "Dorm Essentials", desc: "Furniture, appliances & more" },
              { icon: "🔒", title: "Student Verified", desc: "Only real campus accounts" },
            ].map((p) => (
              <div className="perk" key={p.title}>
                <span className="perk-icon">{p.icon}</span>
                <div>
                  <p className="perk-title">{p.title}</p>
                  <p className="perk-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="left-footer">© 2026 CampusCart. All rights reserved.</p>
      </div>

      {/* RIGHT */}
      <div className="register-right">
        <div className="register-glow" />
        <div className="register-card">

          <div className="card-header">
            <h2>Create account ✨</h2>
            <p>Join CampusCart — it's free for students</p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            {["Account", "Profile"].map((label, i) => {
              const num = i + 1;
              const active = step === num;
              const done = step > num;
              return (
                <div key={label} className="step-item">
                  <div className={`step-dot ${active ? "active" : ""} ${done ? "done" : ""}`}>
                    {done ? "✓" : num}
                  </div>
                  <span className={`step-label ${active ? "active" : ""}`}>{label}</span>
                  {i < 1 && <div className={`step-line ${done ? "done" : ""}`} />}
                </div>
              );
            })}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form className="register-form" onSubmit={handleNext}>
              <div className="form-row-grid">
                <div className="field-group">
                  <label className="field-label">First Name</label>
                  <div className="input-wrap">
                    <input
                      className={`register-input ${errors.firstName ? "error" : ""}`}
                      placeholder="Juan"
                      value={form.firstName}
                      onChange={set("firstName")}
                    />
                  </div>
                  {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                </div>
                <div className="field-group">
                  <label className="field-label">Last Name</label>
                  <div className="input-wrap">
                    <input
                      className={`register-input ${errors.lastName ? "error" : ""}`}
                      placeholder="dela Cruz"
                      value={form.lastName}
                      onChange={set("lastName")}
                    />
                  </div>
                  {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Email</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    className={`register-input ${errors.email ? "error" : ""}`}
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    className={`register-input ${errors.password ? "error" : ""}`}
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={set("password")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}>
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Confirm Password</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <input
                    className={`register-input ${errors.confirm ? "error" : ""} ${passwordsMatch ? "valid" : ""}`}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={set("confirm")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="toggle-pass" onClick={() => setShowConfirm(p => !p)}>
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirm && <span className="field-error">{errors.confirm}</span>}
              </div>

              <button className="register-btn" type="submit">
                Continue →
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form className="register-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label">Course / Program</label>
                <div className="input-wrap select-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  <select
                    className={`register-input register-select ${errors.course ? "error" : ""}`}
                    value={form.course}
                    onChange={set("course")}
                  >
                    <option value="">Select your course</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {errors.course && <span className="field-error">{errors.course}</span>}
              </div>

              <div className="field-group">
                <label className="field-label">Year Level</label>
                <div className="year-grid">
                  {YEAR_LEVELS.map(y => (
                    <button
                      key={y} type="button"
                      className={`year-btn ${form.year === y ? "active" : ""}`}
                      onClick={() => { setForm(f => ({ ...f, year: y })); setErrors(e => ({ ...e, year: "" })); }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
                {errors.year && <span className="field-error">{errors.year}</span>}
              </div>

              <div className="summary-box">
                <p className="summary-title">Account Summary</p>
                <div className="summary-rows">
                  <div className="summary-row"><span>Name</span><span>{form.firstName} {form.lastName}</span></div>
                  <div className="summary-row"><span>Email</span><span>{form.email}</span></div>
                </div>
              </div>

              <div className="step2-actions">
                <button type="button" className="back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className={`register-btn flex1`} type="submit" disabled={loading}>
                  {loading ? <span className="spinner" /> : "Create Account →"}
                </button>
              </div>
            </form>
          )}

          <p className="register-footer">
            Already have an account?{" "}
            <Link to="/" className="login-link">Sign in →</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;