import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseclient";
import "./Profile.css";

const recentActivity = [
  { emoji: "⌨️", item: "Mechanical Keyboard", date: "Feb 28", price: 1500 },
  { emoji: "🖱️", item: "Wireless Mouse", date: "Feb 14", price: 500 },
  { emoji: "💻", item: "Laptop Stand", date: "Jan 30", price: 900 },
];

function Profile() {
  const [profile, setProfile] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const avatarInputRef = useRef(null);
  const toastTimer = useRef(null);

  // ── Load profile on mount ──
  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Not authenticated. Please log in.");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setForm(data);

      if (data.avatar_url) {
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(data.avatar_url);
        setAvatarSrc(urlData.publicUrl);
      }
    } catch (err) {
      showToast(err.message || "Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    clearTimeout(toastTimer.current);
    setToast({ show: true, message, type });
    toastTimer.current = setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      2800
    );
  }

  function openModal() {
    setForm({ ...profile });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // ── Save profile ──
  async function handleSave() {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const updates = {
        id: user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: form.role,
        course: form.course,
        year_level: form.year_level,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates);

      if (error) throw error;

      setProfile((prev) => ({ ...prev, ...updates }));
      closeModal();
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.message || "Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  // ── Upload avatar ──
  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (dbError) throw dbError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarSrc(urlData.publicUrl + `?t=${Date.now()}`);
      setProfile((prev) => ({ ...prev, avatar_url: filePath }));
      showToast("Profile photo updated!");
    } catch (err) {
      showToast(err.message || "Failed to upload photo.", "error");
    }
  }

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : "";
  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
    : "?";

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <p style={{ color: "#f87171" }}>Could not load profile. Please log in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* Left Column */}
        <div className="profile-left">
          <div className="avatar-card">
            <div
              className="avatar-ring"
              onClick={() => avatarInputRef.current?.click()}
              title="Click to upload photo"
            >
              <div className="avatar-circle">
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="avatar-img" />
                  : initials}
              </div>
              <div className="avatar-upload-badge">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.428 11.13a.25.25 0 00-.064.108l-.65 2.274 2.274-.65a.25.25 0 00.108-.064L11.19 6.25z"/>
                </svg>
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />

            <h2 className="profile-name">{fullName || "—"}</h2>
            <span className="role-badge">{profile.role || "Student"}</span>
            <p className="profile-course">{profile.course || "—"}</p>
            <p className="profile-year">{profile.year_level || "—"}</p>

            <div className="profile-divider" />

            <div className="profile-meta">
              <div className="meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{profile.email || "—"}</span>
              </div>
              <div className="meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Joined {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "—"}
                </span>
              </div>
            </div>

            <button className="edit-btn" onClick={openModal}>Edit Profile</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right">

          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{profile.total_orders ?? 0}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card accent">
              <span className="stat-value">₱{(profile.total_spent ?? 0).toLocaleString()}</span>
              <span className="stat-label">Total Spent</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">🏆</span>
              <span className="stat-label">Top Buyer</span>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Recent Orders</h3>
              <button className="view-all-btn">View all →</button>
            </div>
            <div className="activity-list">
              {recentActivity.map((act, i) => (
                <div key={i} className="activity-item" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="activity-icon">{act.emoji}</div>
                  <div className="activity-info">
                    <span className="activity-name">{act.item}</span>
                    <span className="activity-date">{act.date}</span>
                  </div>
                  <span className="activity-price">₱{act.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Account Details</h3>
            </div>
            <div className="details-grid">
              {[
                { label: "Full Name", value: fullName || "—" },
                { label: "Email", value: profile.email || "—" },
                { label: "Role", value: profile.role || "—" },
                { label: "Course", value: profile.course || "—" },
                { label: "Year Level", value: profile.year_level || "—" },
                { label: "Member Since", value: profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                  : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="detail-item">
                  <span className="detail-label">{label}</span>
                  <span className="detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Edit Profile</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-form">
              <div className="form-row-grid">
                <div className="form-field">
                  <label>First Name</label>
                  <input name="first_name" value={form.first_name || ""} onChange={handleFormChange} placeholder="First name" />
                </div>
                <div className="form-field">
                  <label>Last Name</label>
                  <input name="last_name" value={form.last_name || ""} onChange={handleFormChange} placeholder="Last name" />
                </div>
              </div>
              <div className="form-field">
                <label>Email</label>
                <input name="email" type="email" value={form.email || ""} onChange={handleFormChange} placeholder="Email address" />
              </div>
              <div className="form-row-grid">
                <div className="form-field">
                  <label>Role</label>
                  <select name="role" value={form.role || "Student"} onChange={handleFormChange}>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Year Level</label>
                  <select name="year_level" value={form.year_level || "1st Year"} onChange={handleFormChange}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Course</label>
                <input name="course" value={form.course || ""} onChange={handleFormChange} placeholder="Course / Program" />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal} disabled={saving}>Cancel</button>
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast-notification ${toast.show ? "toast-visible" : ""} ${toast.type === "error" ? "toast-error" : ""}`}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          {toast.type === "error"
            ? <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm-.75-5.25a.75.75 0 001.5 0v-4.5a.75.75 0 00-1.5 0v4.5zm.75 2.5a.875.875 0 100-1.75.875.875 0 000 1.75z"/>
            : <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"/>}
        </svg>
        {toast.message}
      </div>
    </div>
  );
}

export default Profile;