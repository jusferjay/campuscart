import "./Profile.css";

const profileData = {
  name: "Campus User",
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
  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* Left Column */}
        <div className="profile-left">
          <div className="avatar-card">
            <div className="avatar-ring">
              <div className="avatar-circle">CU</div>
            </div>
            <h2 className="profile-name">{profileData.name}</h2>
            <span className="role-badge">{profileData.role}</span>
            <p className="profile-course">{profileData.course}</p>
            <p className="profile-year">{profileData.year}</p>

            <div className="profile-divider" />

            <div className="profile-meta">
              <div className="meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <span>{profileData.email}</span>
              </div>
              <div className="meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Joined {profileData.joined}</span>
              </div>
            </div>

            <button className="edit-btn">Edit Profile</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right">

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{profileData.orders}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card accent">
              <span className="stat-value">₱{profileData.spent.toLocaleString()}</span>
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
                { label: "Full Name", value: profileData.name },
                { label: "Email", value: profileData.email },
                { label: "Role", value: profileData.role },
                { label: "Course", value: profileData.course },
                { label: "Year Level", value: profileData.year },
                { label: "Member Since", value: profileData.joined },
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
    </div>
  );
}

export default Profile;