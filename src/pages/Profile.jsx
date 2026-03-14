import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import "./Profile.css";

const initialProfile = {
  firstName: "Campus",
  lastName: "User",
  email: "user@email.com",
  role: "Student",
  course: "BS Computer Science",
  year: "3rd Year",
  joined: "August 2023",
  orders: 12,
  spent: 8450,
};

const recentActivity = [
  { emoji: "⌨️", item: "Mechanical Keyboard", date: "Feb 28", price: 1500 },
  { emoji: "🖱️", item: "Wireless Mouse", date: "Feb 14", price: 500 },
  { emoji: "💻", item: "Laptop Stand", date: "Jan 30", price: 900 },
];

function Profile() {

  const [profile, setProfile] = useState(initialProfile);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [form, setForm] = useState({ ...initialProfile });

  const avatarInputRef = useRef(null);
  const toastTimer = useRef(null);

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase();

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (data) {
      const names = data.full_name?.split(" ") || [];

      setProfile((prev) => ({
        ...prev,
        firstName: names[0] || "",
        lastName: names[1] || "",
        role: data.role || prev.role
      }));
    }
  }

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

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userData.user.id,
        full_name: `${form.firstName} ${form.lastName}`,
        role: form.role,
      });

    if (error) {
      console.error(error);
      showToast("Error saving profile");
      return;
    }

    setProfile({ ...form });
    closeModal();
    showToast("Profile updated successfully!");
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

        <div className="profile-left">

          <div className="avatar-card">

            <div className="avatar-ring" onClick={handleAvatarClick}>

              <div className="avatar-circle">
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="avatar-img" />
                  : initials}
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
                <span>{profile.email}</span>
              </div>

              <div className="meta-row">
                <span>Joined {profile.joined}</span>
              </div>

            </div>

            <button className="edit-btn" onClick={openModal}>
              Edit Profile
            </button>

          </div>

        </div>

        <div className="profile-right">

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

          <div className="section-card">

            <h3 className="section-title">Recent Orders</h3>

            <div className="activity-list">

              {recentActivity.map((act, i) => (

                <div key={i} className="activity-item">

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

            <h3 className="section-title">Account Details</h3>

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

      {modalOpen && (

        <div className="modal-overlay">

          <div className="modal-box">

            <h3>Edit Profile</h3>

            <input name="firstName" value={form.firstName} onChange={handleFormChange} />

            <input name="lastName" value={form.lastName} onChange={handleFormChange} />

            <input name="email" value={form.email} onChange={handleFormChange} />

            <button onClick={closeModal}>Cancel</button>

            <button onClick={handleSave}>Save Changes</button>

          </div>

        </div>

      )}

      <div className={`toast-notification ${toast.show ? "toast-visible" : ""}`}>
        {toast.message}
      </div>

    </div>
  );
}

export default Profile;