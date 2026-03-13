import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ sellers: 0, buyers: 0, products: 0, pending: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return navigate("/dashboard");
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    const [{ data: users }, { data: products }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*, profiles(full_name)").order("created_at", { ascending: false }),
    ]);
    if (users) {
      setStats({
        sellers: users.filter(u => u.role === "seller").length,
        buyers:  users.filter(u => u.role === "buyer").length,
        products: products?.length || 0,
        pending: products?.filter(p => !p.is_approved).length || 0,
      });
      setRecentUsers(users.slice(0, 5));
    }
    if (products) setRecentProducts(products.slice(0, 5));
    setLoading(false);
  };

  const approveProduct = async (id) => {
    await supabase.from("products").update({ is_approved: true }).eq("id", id);
    fetchData();
  };

  if (loading) return <div className="ad-loading"><div className="ad-spinner" /><p>Loading dashboard...</p></div>;

  return (
    <div className="ad-page">
      <div className="ad-header">
        <div>
          <h1 className="ad-title">Admin Dashboard</h1>
          <p className="ad-sub">Welcome back — here's what's happening on CampusCart</p>
        </div>
        <div className="ad-header-actions">
          <button className="ad-btn-outline" onClick={() => navigate("/admin/users")}>Manage Users</button>
          <button className="ad-btn-outline" onClick={() => navigate("/admin/products")}>Manage Products</button>
        </div>
      </div>

      {/* Stats */}
      <div className="ad-stats">
        {[
          { label: "Total Sellers",   value: stats.sellers,  icon: "🏪", color: "green"  },
          { label: "Total Buyers",    value: stats.buyers,   icon: "🧑‍🎓", color: "blue"   },
          { label: "Total Products",  value: stats.products, icon: "📦", color: "purple" },
          { label: "Pending Approval",value: stats.pending,  icon: "⏳", color: "orange" },
        ].map(s => (
          <div key={s.label} className={`ad-stat-card ad-stat-${s.color}`}>
            <span className="ad-stat-icon">{s.icon}</span>
            <span className="ad-stat-val">{s.value}</span>
            <span className="ad-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="ad-grid">
        {/* Recent Users */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3>Recent Users</h3>
            <button className="ad-link" onClick={() => navigate("/admin/users")}>View all →</button>
          </div>
          <table className="ad-table">
            <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.full_name}</strong><br/><span className="ad-email">{u.email}</span></td>
                  <td><span className={`ad-role-tag ad-role-${u.role}`}>{u.role}</span></td>
                  <td><span className={`ad-status ${u.is_active ? "active" : "inactive"}`}>{u.is_active ? "Active" : "Suspended"}</span></td>
                  <td className="ad-date">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending Products */}
        <div className="ad-card">
          <div className="ad-card-header">
            <h3>Pending Approvals <span className="ad-pending-count">{stats.pending}</span></h3>
            <button className="ad-link" onClick={() => navigate("/admin/products")}>View all →</button>
          </div>
          {recentProducts.filter(p => !p.is_approved).length === 0 ? (
            <div className="ad-empty">✅ No pending products</div>
          ) : (
            <table className="ad-table">
              <thead><tr><th>Product</th><th>Seller</th><th>Price</th><th>Action</th></tr></thead>
              <tbody>
                {recentProducts.filter(p => !p.is_approved).map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td className="ad-email">{p.profiles?.full_name}</td>
                    <td>₱{Number(p.price).toLocaleString()}</td>
                    <td><button className="ad-approve-btn" onClick={() => approveProduct(p.id)}>Approve</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}