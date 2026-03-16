import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase.js";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [form, setForm] = useState({});
  const [fallbackMode, setFallbackMode] = useState(false);
  const avatarInputRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile (falling back):', error);
        setError(error.message || "Failed to load profile.");
        setFallbackMode(true);
      }

      if (data) {
        setProfile(data);
        setForm(data);
        showToast("Profile loaded from Supabase.");
      } else {
        // Reset fallback if we just created a profile
        setFallbackMode(false);

        // Create default profile if not exists
        const defaultProfile = {
          user_id: user.id,
          first_name: 'Campus',
          last_name: 'User',
          email: user.email,
          role: 'Student',
          course: 'BS Computer Science',
          year: '3rd Year',
          joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          orders: 0,
          spent: 0,
        };
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          setError(insertError.message || "Failed to create profile.");
          setFallbackMode(true);
          setProfile(defaultProfile);
          setForm(defaultProfile);
        } else {
          setProfile(defaultProfile);
          setForm(defaultProfile);
          showToast("Profile created and loaded from Supabase.");
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err?.message || "An unexpected error occurred while loading profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="profile-page"><div className="loading">Loading profile...</div></div>;
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="error">
          {error || "Unable to load profile. Please try logging in again."}
        </div>
      </div>
    );
  }

  // If we're in fallback mode (Supabase table missing / permissions issue), show a notice.
  const fallbackNotice = fallbackMode ? (
    <div className="profile-error">
      Unable to load saved profile from Supabase. You can still edit locally, but changes may not persist.
    </div>
  ) : null;

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const initials = `${profile.first_name[0] || ""}${profile.last_name[0] || ""}`.toUpperCase();

  function showToast(message) {
    clearTimeout(toastTimer.current);
    setToast({ show: true, message });
    toastTimer.current = setTimeout(() => setToast({ show: false, message: "" }), 2800);
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

  async function handleSave() {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          role: form.role,
          course: form.course,
          year: form.year,
        })
        .eq('user_id', profile.user_id);

      if (error) {
        console.error('Error updating profile:', error);
        showToast("Error updating profile.");
        return;
      }

      setProfile({ ...form });
      closeModal();
      showToast("Profile updated successfully!");
    } catch (err) {
      console.error('Error:', err);
      showToast("Error updating profile.");
    }
  }

  function handleAvatarClick() {
    avatarInputRef.current?.click();
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarSrc(ev.target.result);
      showToast("Profile photo updated!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="profile-page">
      <div className="profile-inner">
        {fallbackNotice}

        {/* Left Column */}
        <div className="profile-left">
          <div className="avatar-card">
            <div className="avatar-ring" onClick={handleAvatarClick} title="Click to upload photo">
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

            <h2 className="profile-name">{fullName}</h2>
            <span className="role-badge">{profile.role}</span>
            <p className="profile-course">{profile.course}</p>
            <p className="profile-year">{profile.year}</p>

            <div className="profile-divider" />

            <div className="profile-meta">
              <div className="meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{profile.email}</span>
              </div>
              <div className="meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Joined {profile.joined}</span>
              </div>
            </div>

            <button className="edit-btn" onClick={openModal}>Edit Profile</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right">

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{profile.orders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card accent">
              <span className="stat-value">₱{profile.spent.toLocaleString()}</span>
              <span className="stat-label">Total Spent</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">🏆</span>
              <span className="stat-label">Top Buyer</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Recent Orders</h3>
              <button className="view-all-btn">View all →</button>
            </div>
            <div className="activity-list">
              {recentActivity.map((act, i) => (
                <div
                  key={i}
                  className="activity-item"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
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

          {/* Account Details */}
          <div className="section-card">
            <div className="section-header">
              <h3 className="section-title">Account Details</h3>
            </div>
            <div className="details-grid">
              {[
                { label: "Full Name", value: fullName },
                { label: "Email", value: profile.email },
                { label: "Role", value: profile.role },
                { label: "Course", value: profile.course },
                { label: "Year Level", value: profile.year },
                { label: "Member Since", value: profile.joined },
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
                  <select name="role" value={form.role} onChange={handleFormChange}>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Year Level</label>
                  <select name="year" value={form.year || ""} onChange={handleFormChange}>
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
                <input name="course" value={form.course} onChange={handleFormChange} placeholder="Course / Program" />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button className="btn-save" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`toast-notification ${toast.show ? "toast-visible" : ""}`}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"/>
        </svg>
        {toast.message}
      </div>
    </div>
  );
}

export default Profile;