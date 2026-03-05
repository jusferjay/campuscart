import { useState } from "react";
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

function Settings() {
  const initial = {};
  SETTINGS_CONFIG.forEach(g => g.items.forEach(i => { initial[i.id] = i.default; }));
  const [prefs, setPrefs] = useState(initial);
  const [saved, setSaved] = useState(false);

  const toggle = (id) => setPrefs(p => ({ ...p, [id]: !p[id] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
          <button
            className={`save-btn ${saved ? "saved" : ""}`}
            onClick={handleSave}
          >
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

        {/* Groups */}
        <div className="settings-groups">
          {SETTINGS_CONFIG.map((group, gi) => (
            <div
              key={group.group}
              className="settings-group"
              style={{ animationDelay: `${gi * 80}ms` }}
            >
              <div className="group-label">
                <span className="group-icon">{group.icon}</span>
                <span className="group-title">{group.group}</span>
              </div>

              <div className="group-items">
                {group.items.map((item, ii) => (
                  <div key={item.id} className="setting-row">
                    <div className="setting-info">
                      <span className="setting-label">{item.label}</span>
                      <span className="setting-desc">{item.desc}</span>
                    </div>
                    <Toggle
                      enabled={prefs[item.id]}
                      onToggle={() => toggle(item.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            <button className="danger-btn outline">Clear Cart</button>
            <button className="danger-btn outline">Reset Preferences</button>
            <button className="danger-btn red">Delete Account</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;