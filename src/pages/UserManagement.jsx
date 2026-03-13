import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./UserManagement.css";

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState(null);

  useEffect(() => { checkAdmin(); }, []);
  useEffect(() => { applyFilter(); }, [users, search, roleFilter]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (!profile || profile.role !== "admin") return navigate("/dashboard");
    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const applyFilter = () => {
    let list = [...users];
    if (roleFilter !== "all") list = list.filter(u => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
    }
    setFiltered(list);
  };

  const toggleStatus = async (id, current) => {
    const { error } = await supabase.from("profiles").update({ is_active: !current }).eq("id", id);
    if (!error) { fetchUsers(); showToast(`User ${!current ? "activated" : "suspended"}`); }
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) { fetchUsers(); showToast("User deleted"); }
    else showToast("Error deleting user", "error");
  };

  if (loading) return <div className="um-loading"><div className="um-spinner" /><p>Loading users...</p></div>;

  const counts = {
    all: users.length,
    admin: users.filter(u => u.role === "admin").length,
    seller: users.filter(u => u.role === "seller").length,
    buyer: users.filter(u => u.role === "buyer").length,
  };

  return (
    <div className="um-page">
      {toast && <div className={`um-toast um-toast-${toast.type}`}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}</div>}

      <div className="um-header">
        <div>
          <button className="um-back" onClick={() => navigate("/admin")}>← Back to Dashboard</button>
          <h1 className="um-title">User Management</h1>
          <p className="um-sub">{users.length} total users registered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="um-toolbar">
        <div className="um-role-tabs">
          {["all","admin","seller","buyer"].map(r => (
            <button
              key={r}
              className={`um-rtab ${roleFilter === r ? "active" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
              <span className="um-rtab-count">{counts[r]}</span>
            </button>
          ))}
        </div>
        <div className="um-search-wrap">
          <svg className="um-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="um-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="um-card">
        <table className="um-table">
          <thead>
            <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="um-empty">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="um-user-cell">
                    <div className={`um-avatar um-avatar-${u.role}`}>
                      {u.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="um-name">{u.full_name}</div>
                      <div className="um-email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className={`um-role-tag um-role-${u.role}`}>{u.role}</span></td>
                <td>
                  <span className={`um-status ${u.is_active ? "active" : "inactive"}`}>
                    {u.is_active ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="um-date">{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="um-actions">
                    <button
                      className={`um-btn ${u.is_active ? "um-btn-warn" : "um-btn-green"}`}
                      onClick={() => toggleStatus(u.id, u.is_active)}
                    >
                      {u.is_active ? "Suspend" : "Activate"}
                    </button>
                    <button className="um-btn um-btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}