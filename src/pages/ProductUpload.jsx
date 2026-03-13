import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import "./ProductUpload.css";

const CATEGORIES = ["Books & Notes", "Electronics", "Clothing", "Food & Snacks", "Stationery", "Services", "Others"];
const EMPTY = { title: "", description: "", price: "", category: "", stock: "", image_url: "" };

export default function ProductUpload() {
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { checkSeller(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const checkSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate("/");
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!profile || profile.role !== "seller") return navigate("/dashboard");
    setSeller(profile);
    setChecking(false);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = "Product title is required";
    if (!form.price)           e.price    = "Price is required";
    if (Number(form.price) < 0) e.price   = "Price cannot be negative";
    if (!form.category)        e.category = "Please select a category";
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setLoading(true);
    try {
      const { error } = await supabase.from("products").insert({
        seller_id:   seller.id,
        title:       form.title.trim(),
        description: form.description.trim(),
        price:       parseFloat(form.price),
        category:    form.category,
        stock:       parseInt(form.stock) || 0,
        image_url:   form.image_url.trim() || null,
        is_approved: false,
      });
      if (error) throw error;
      showToast("Product submitted! Waiting for admin approval.");
      setForm(EMPTY);
    } catch (err) {
      showToast(err.message || "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="pu-loading"><div className="pu-spinner" /><p>Checking access...</p></div>;

  return (
    <div className="pu-page">
      {toast && <div className={`pu-toast pu-toast-${toast.type}`}>{toast.type === "success" ? "✅" : "❌"} {toast.msg}</div>}

      <div className="pu-container">
        {/* Left — Form */}
        <div className="pu-form-wrap">
          <div className="pu-header">
            <button className="pu-back" onClick={() => navigate("/seller")}>← Back to My Store</button>
            <h1 className="pu-title">Add New Product</h1>
            <p className="pu-sub">Fill in the details below. Your product will be reviewed before going live.</p>
          </div>

          <form onSubmit={handleSubmit} className="pu-form">
            {/* Title */}
            <div className={`pu-field ${errors.title ? "has-error" : ""}`}>
              <label>Product Title <span className="pu-req">*</span></label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Engineering Math Book Vol. 2" />
              {errors.title && <span className="pu-error-msg">{errors.title}</span>}
            </div>

            {/* Description */}
            <div className="pu-field">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your product — condition, edition, included items..." rows={4} />
            </div>

            {/* Price + Stock */}
            <div className="pu-row">
              <div className={`pu-field ${errors.price ? "has-error" : ""}`}>
                <label>Price (₱) <span className="pu-req">*</span></label>
                <div className="pu-input-prefix">
                  <span className="pu-prefix">₱</span>
                  <input name="price" type="number" min="0" step="0.01"
                    value={form.price} onChange={handleChange} placeholder="0.00" />
                </div>
                {errors.price && <span className="pu-error-msg">{errors.price}</span>}
              </div>
              <div className="pu-field">
                <label>Stock Quantity</label>
                <input name="stock" type="number" min="0"
                  value={form.stock} onChange={handleChange} placeholder="1" />
              </div>
            </div>

            {/* Category */}
            <div className={`pu-field ${errors.category ? "has-error" : ""}`}>
              <label>Category <span className="pu-req">*</span></label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="pu-error-msg">{errors.category}</span>}
            </div>

            {/* Image URL */}
            <div className="pu-field">
              <label>Image URL <span className="pu-optional">(optional)</span></label>
              <input name="image_url" type="url" value={form.image_url} onChange={handleChange}
                placeholder="https://example.com/image.jpg" />
            </div>

            {/* Notice */}
            <div className="pu-notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Products are reviewed by admin before appearing in the store.
            </div>

            <button type="submit" className="pu-submit" disabled={loading}>
              {loading ? <span className="pu-spinner-sm" /> : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12l7 7 7-7"/>
                  </svg>
                  Submit Product
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right — Preview */}
        <div className="pu-preview-wrap">
          <div className="pu-preview-label">Live Preview</div>
          <div className="pu-preview-card">
            <div className="pu-preview-img">
              {form.image_url
                ? <img src={form.image_url} alt="preview" onError={e => e.target.style.display="none"} />
                : <div className="pu-preview-noimg">📦</div>
              }
              <span className="pu-preview-badge">⏳ Pending</span>
            </div>
            <div className="pu-preview-body">
              <span className="pu-preview-cat">{form.category || "Category"}</span>
              <h4 className="pu-preview-title">{form.title || "Product Title"}</h4>
              <p className="pu-preview-desc">{form.description || "Product description will appear here..."}</p>
              <div className="pu-preview-meta">
                <span className="pu-preview-price">
                  {form.price ? `₱${Number(form.price).toLocaleString()}` : "₱0"}
                </span>
                <span className="pu-preview-stock">{form.stock || 0} in stock</span>
              </div>
              <div className="pu-preview-seller">by {seller?.full_name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}