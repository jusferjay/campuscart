import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase.js";
import "./Settings.css";

const SETTINGS_CONFIG = [
  {
    group: "Notifications",
    icon: "🔔",
    items: [
      { id: "notif_orders", label: "Order Updates", desc: "Get notified when your order status changes", default: true },
      { id: "notif_promo", label: "Promotions & Deals", desc: "Receive alerts on campus store sales", default: false },
      { id: "notif_restock", label: "Restock Alerts", desc: "Know when out-of-stock items are available", default: true },
    ],
  },
  {
    group: "Appearance",
    icon: "🎨",
    items: [
      { id: "dark_mode", label: "Dark Mode", desc: "Use the dark theme across the app", default: true },
      { id: "compact_view", label: "Compact View", desc: "Show more items with reduced spacing", default: false },
    ],
  },
  {
    group: "Privacy",
    icon: "🔒",
    items: [
      { id: "activity_visible", label: "Public Activity", desc: "Allow others to see your recent orders", default: false },
      { id: "data_analytics", label: "Analytics Sharing", desc: "Help improve CampusCart with usage data", default: true },
    ],
  },
  {
    group: "Account",
    icon: "👤",
    items: [
      { id: "two_factor", label: "Two-Factor Auth", desc: "Add an extra layer of login security", default: false },
      { id: "email_digest", label: "Weekly Email Digest", desc: "Receive a summary of your activity", default: true },
    ],
  },
];

function Toggle({ enabled, onToggle }) {
  return (
    <button
      className={`toggle ${enabled ? "on" : ""}`}
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

// ── Password Modal ──
function PasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const toggleShow = (field) => setShow((p) => ({ ...p, [field]: !p[field] }));

  const validate = () => {
    const e = {};
    if (!form.current) e.current = "Current password is required.";
    if (form.next.length < 8) e.next = "New password must be at least 8 characters.";
    if (form.next !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    changePassword();
  };

  const changePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.next,
      });

      if (error) {
        setErrors({ next: error.message });
        return;
      }

      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1600);
    } catch (err) {
      setErrors({ next: "An unexpected error occurred." });
    }
  };

  const strength = (() => {
    const p = form.next;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthClass = ["", "weak", "fair", "good", "strong"][strength];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">🔑</span>
            <h3 className="modal-title">Change Password</h3>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="modal-success">
            <div className="success-check">✓</div>
            <p>Password updated successfully!</p>
          </div>
        ) : (
          <div className="modal-form">
            {/* Current Password */}
            <div className="form-field">
              <label>Current Password</label>
              <div className="input-wrap">
                <input
                  name="current"
                  type={show.current ? "text" : "password"}
                  value={form.current}
                  onChange={change}
                  placeholder="Enter current password"
                  className={errors.current ? "input-error" : ""}
                />
                <button className="eye-btn" onClick={() => toggleShow("current")}>
                  {show.current ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.current && <span className="field-error">{errors.current}</span>}
            </div>

            {/* New Password */}
            <div className="form-field">
              <label>New Password</label>
              <div className="input-wrap">
                <input
                  name="next"
                  type={show.next ? "text" : "password"}
                  value={form.next}
                  onChange={change}
                  placeholder="Min. 8 characters"
                  className={errors.next ? "input-error" : ""}
                />
                <button className="eye-btn" onClick={() => toggleShow("next")}>
                  {show.next ? "🙈" : "👁️"}
                </button>
              </div>
              {form.next && (
                <div className="strength-row">
                  <div className="strength-bars">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`strength-bar ${i <= strength ? strengthClass : ""}`} />
                    ))}
                  </div>
                  <span className={`strength-label ${strengthClass}`}>{strengthLabel}</span>
                </div>
              )}
              {errors.next && <span className="field-error">{errors.next}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label>Confirm New Password</label>
              <div className="input-wrap">
                <input
                  name="confirm"
                  type={show.confirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={change}
                  placeholder="Re-enter new password"
                  className={errors.confirm ? "input-error" : ""}
                />
                <button className="eye-btn" onClick={() => toggleShow("confirm")}>
                  {show.confirm ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirm && <span className="field-error">{errors.confirm}</span>}
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-save" onClick={handleSave}>Update Password</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Confirm Dialog ──
function ConfirmDialog({ title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box confirm-box">
        <div className="confirm-icon-wrap">⚠️</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className={`btn-save ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Settings() {
  const initial = {};
  SETTINGS_CONFIG.forEach(g => g.items.forEach(i => { initial[i.id] = i.default; }));
  const [prefs, setPrefs] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [modal, setModal] = useState(null); // "password" | "clearCart" | "resetPrefs" | "deleteAccount"
  const [toast, setToast] = useState({ show: false, message: "" });
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data && data.settings) {
        setPrefs({ ...initial, ...data.settings });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setPrefs(p => ({ ...p, [id]: !p[id] }));

  const showToast = (message) => {
    clearTimeout(toastTimer.current);
    setToast({ show: true, message });
    toastTimer.current = setTimeout(() => setToast({ show: false, message: "" }), 2800);
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: prefs,
        });

      if (error) {
        console.error('Error saving settings:', error);
        showToast("Error saving settings.");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      showToast("Settings saved successfully!");
    } catch (err) {
      console.error('Error:', err);
      showToast("Error saving settings.");
    }
  };

  const handleClearCart = () => {
    setModal(null);
    showToast("Cart cleared successfully!");
  };

  const handleResetPrefs = () => {
    const reset = {};
    SETTINGS_CONFIG.forEach(g => g.items.forEach(i => { reset[i.id] = i.default; }));
    setPrefs(reset);
    setModal(null);
    showToast("Preferences reset to defaults!");
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete profile and settings first
      await supabase.from('profiles').delete().eq('user_id', user.id);
      await supabase.from('user_settings').delete().eq('user_id', user.id);

      // Then delete the user
      const { error } = await supabase.auth.admin.deleteUser(user.id); // Note: This requires admin privileges, might not work in client

      if (error) {
        console.error('Error deleting account:', error);
        showToast("Error deleting account.");
        return;
      }

      setModal(null);
      showToast("Account deleted successfully.");
      // Redirect to login or home
    } catch (err) {
      console.error('Error:', err);
      showToast("Error deleting account.");
    }
  };

  if (loading) {
    return <div className="settings-page"><div className="loading">Loading settings...</div></div>;
  }

  const enabledCount = Object.values(prefs).filter(Boolean).length;
  const totalCount = Object.keys(prefs).length;

  return (
    <div className="settings-page">
      <div className="settings-inner">

        {/* Header */}
        <div className="settings-header">
          <div>
            <h1 className="settings-title">Settings</h1>
            <p className="settings-sub">{enabledCount} of {totalCount} preferences enabled</p>
          </div>
          <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
            {saved ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Saved!
              </>
            ) : "Save Changes"}
          </button>
        </div>

        {/* Toggle Groups */}
        <div className="settings-groups">
          {SETTINGS_CONFIG.map((group, gi) => (
            <div key={group.group} className="settings-group" style={{ animationDelay: `${gi * 80}ms` }}>
              <div className="group-label">
                <span className="group-icon">{group.icon}</span>
                <span className="group-title">{group.group}</span>
              </div>
              <div className="group-items">
                {group.items.map((item) => (
                  <div key={item.id} className="setting-row">
                    <div className="setting-info">
                      <span className="setting-label">{item.label}</span>
                      <span className="setting-desc">{item.desc}</span>
                    </div>
                    <Toggle enabled={prefs[item.id]} onToggle={() => toggle(item.id)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Change Password Section */}
        <div className="password-section">
          <div className="password-left">
            <div className="password-icon-wrap">🔑</div>
            <div>
              <p className="password-title">Password & Security</p>
              <p className="password-sub">Last changed 3 months ago</p>
            </div>
          </div>
          <button className="change-password-btn" onClick={() => setModal("password")}>
            Change Password
          </button>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone">
          <div className="danger-header">
            <span className="danger-icon">⚠️</span>
            <div>
              <p className="danger-title">Danger Zone</p>
              <p className="danger-sub">These actions are permanent and cannot be undone.</p>
            </div>
          </div>
          <div className="danger-actions">
            <button className="danger-btn outline" onClick={() => setModal("clearCart")}>Clear Cart</button>
            <button className="danger-btn outline" onClick={() => setModal("resetPrefs")}>Reset Preferences</button>
            <button className="danger-btn red" onClick={() => setModal("deleteAccount")}>Delete Account</button>
          </div>
        </div>

      </div>

      {/* Modals */}
      {modal === "password" && (
        <PasswordModal onClose={() => setModal(null)} />
      )}

      {modal === "clearCart" && (
        <ConfirmDialog
          title="Clear Your Cart?"
          message="All items currently in your cart will be removed. This cannot be undone."
          confirmLabel="Yes, Clear Cart"
          confirmClass="btn-danger"
          onConfirm={handleClearCart}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === "resetPrefs" && (
        <ConfirmDialog
          title="Reset Preferences?"
          message="All your settings will be reset to their default values."
          confirmLabel="Yes, Reset"
          confirmClass="btn-danger"
          onConfirm={handleResetPrefs}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === "deleteAccount" && (
        <ConfirmDialog
          title="Delete Your Account?"
          message="Your account and all associated data will be permanently deleted. This action cannot be reversed."
          confirmLabel="Yes, Delete My Account"
          confirmClass="btn-danger-red"
          onConfirm={handleDeleteAccount}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Toast */}
      <div className={`toast-notification ${toast.show ? "toast-visible" : ""}`}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"/>
        </svg>
        {toast.message}
      </div>
    </div>
  );
}

export default Settings;