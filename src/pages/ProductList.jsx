import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./ProductList.css";

const CATEGORIES = ["All", "Books & Notes", "Electronics", "Clothing", "Food & Snacks", "Stationery", "Services", "Others"];

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState(null);

  useEffect(() => { init(); }, []);
  useEffect(() => { applyFilter(); }, [products, search, category]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile) setUserRole(profile.role);
    fetchProducts(profile?.role);
  };

  const fetchProducts = async (role) => {
    setLoading(true);
    let query = supabase.from("products").select("*, profiles(full_name)").order("created_at", { ascending: false });
    // Admin sees all; others see only approved
    if (role !== "admin") query = query.eq("is_approved", true);
    const { data } = await query;
    if (data) setProducts(data);
    setLoading(false);
  };

  const applyFilter = () => {
    let list = [...products];
    if (category !== "All") list = list.filter(p => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    setFiltered(list);
  };

  const approveProduct = async (id) => {
    await supabase.from("products").update({ is_approved: true }).eq("id", id);
    showToast("Product approved!");
    fetchProducts(userRole);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    showToast("Product deleted");
    fetchProducts(userRole);
  };

  if (loading) return <div className="pl-loading"><div className="pl-spinner" /><p>Loading products...</p></div>;

  return (
    <div className="pl-page">
      {toast && <div className={`pl-toast pl-toast-${toast.type}`}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}</div>}

      <div className="pl-header">
        <div>
          <h1 className="pl-title">
            {userRole === "admin" ? "All Products" : "Campus Store"}
          </h1>
          <p className="pl-sub">{filtered.length} {filtered.length === 1 ? "product" : "products"} found</p>
        </div>
        {userRole === "admin" && (
          <button className="pl-btn-outline" onClick={() => navigate("/admin")}>← Back to Dashboard</button>
        )}
      </div>

      {/* Filters */}
      <div className="pl-toolbar">
        <div className="pl-search-wrap">
          <svg className="pl-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="pl-search"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="pl-cats">
          {CATEGORIES.map(c => (
            <button key={c} className={`pl-cat ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="pl-empty">
          <div className="pl-empty-icon">📦</div>
          <h3>No products found</h3>
          <p>Try a different search or category</p>
        </div>
      ) : (
        <div className="pl-grid">
          {filtered.map(p => (
            <div key={p.id} className="pl-card">
              <div className="pl-card-img">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} />
                  : <div className="pl-no-img">📦</div>
                }
                {userRole === "admin" && (
                  <span className={`pl-approval-badge ${p.is_approved ? "approved" : "pending"}`}>
                    {p.is_approved ? "✅ Approved" : "⏳ Pending"}
                  </span>
                )}
              </div>
              <div className="pl-card-body">
                <span className="pl-cat-tag">{p.category}</span>
                <h4 className="pl-card-title">{p.title}</h4>
                <p className="pl-card-desc">{p.description || "No description provided"}</p>
                <div className="pl-card-meta">
                  <span className="pl-price">₱{Number(p.price).toLocaleString()}</span>
                  <span className="pl-seller">by {p.profiles?.full_name || "Unknown"}</span>
                </div>
              </div>
              {userRole === "admin" && (
                <div className="pl-card-actions">
                  {!p.is_approved && (
                    <button className="pl-btn pl-btn-approve" onClick={() => approveProduct(p.id)}>✅ Approve</button>
                  )}
                  <button className="pl-btn pl-btn-delete" onClick={() => deleteProduct(p.id)}>🗑️ Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}