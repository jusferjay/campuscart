import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import './SellerDashboard.css'

const CATEGORIES = ['Books & Notes', 'Electronics', 'Clothing', 'Food & Snacks', 'Stationery', 'Services', 'Others']

const EMPTY_FORM = { title: '', description: '', price: '', category: '', stock: '', image_url: '' }

export default function SellerDashboard() {
  const navigate = useNavigate()
  const [seller, setSeller] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('products')

  useEffect(() => { checkSeller() }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const checkSeller = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return navigate('/login')

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    if (!profile || profile.role !== 'seller') {
      navigate('/dashboard')
      return
    }
    setSeller(profile)
    fetchProducts(user.id)
  }

  const fetchProducts = async (sellerId) => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  const openAddForm = () => {
    setForm(EMPTY_FORM)
    setEditProduct(null)
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setForm({
      title: product.title,
      description: product.description || '',
      price: product.price,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url || ''
    })
    setEditProduct(product)
    setShowForm(true)
  }

  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setFormLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock) || 0,
        image_url: form.image_url || null,
        seller_id: seller.id,
        is_approved: false,
      }

      if (editProduct) {
        const { error } = await supabase
          .from('products').update(payload).eq('id', editProduct.id)
        if (error) throw error
        showToast('Product updated successfully!')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        showToast('Product submitted for approval!')
      }

      setShowForm(false)
      fetchProducts(seller.id)
    } catch (err) {
      showToast(err.message || 'Something went wrong.', 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      fetchProducts(seller.id)
      showToast('Product deleted')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const approved = products.filter(p => p.is_approved)
  const pending = products.filter(p => !p.is_approved)

  if (loading) return (
    <div className="seller-loading">
      <div className="loading-spinner" /><p>Loading your store...</p>
    </div>
  )

  return (
    <div className="seller-page">
      {toast && (
        <div className={`seller-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* TOPBAR */}
      <header className="seller-header">
        <div className="seller-header-left">
          <Link to="/" className="seller-logo">🛒 CampusCart</Link>
          <span className="seller-badge">Seller Portal</span>
        </div>
        <div className="seller-header-right">
          <div className="seller-user">
            <div className="seller-avatar">{seller?.full_name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="seller-uname">{seller?.full_name}</div>
              <div className="seller-uemail">{seller?.email}</div>
            </div>
          </div>
          <button className="btn-logout-seller" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <div className="seller-body">
        {/* STATS ROW */}
        <div className="seller-stats">
          <div className="sstat-card">
            <div className="sstat-num">{products.length}</div>
            <div className="sstat-label">Total Products</div>
          </div>
          <div className="sstat-card green">
            <div className="sstat-num">{approved.length}</div>
            <div className="sstat-label">Approved</div>
          </div>
          <div className="sstat-card orange">
            <div className="sstat-num">{pending.length}</div>
            <div className="sstat-label">Pending Review</div>
          </div>
          <div className="sstat-card blue">
            <div className="sstat-num">
              ₱{products.reduce((sum, p) => sum + Number(p.price), 0).toLocaleString()}
            </div>
            <div className="sstat-label">Total Value Listed</div>
          </div>
        </div>

        {/* TABS + ADD BUTTON */}
        <div className="seller-toolbar">
          <div className="seller-tabs">
            <button className={`stab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              All Products
            </button>
            <button className={`stab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
              Pending {pending.length > 0 && <span className="stab-badge">{pending.length}</span>}
            </button>
            <button className={`stab ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
              Approved
            </button>
          </div>
          <button className="btn-add-product" onClick={openAddForm}>
            + Add Product
          </button>
        </div>

        {/* PRODUCTS GRID */}
        <div className="products-area">
          {(activeTab === 'products' ? products : activeTab === 'pending' ? pending : approved).length === 0 ? (
            <div className="empty-products">
              <div className="empty-icon">📦</div>
              <h3>No products here yet</h3>
              <p>Click "Add Product" to list your first item</p>
              <button className="btn-add-product" onClick={openAddForm}>+ Add Product</button>
            </div>
          ) : (
            <div className="products-grid">
              {(activeTab === 'products' ? products : activeTab === 'pending' ? pending : approved).map(product => (
                <div className="product-card" key={product.id}>
                  <div className="product-card-img">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.title} />
                      : <div className="product-no-img">📦</div>
                    }
                    <span className={`product-status-badge ${product.is_approved ? 'approved' : 'pending'}`}>
                      {product.is_approved ? '✅ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                  <div className="product-card-body">
                    <div className="product-category-tag">{product.category}</div>
                    <h4 className="product-title">{product.title}</h4>
                    <p className="product-desc">{product.description || 'No description'}</p>
                    <div className="product-meta">
                      <span className="product-price">₱{Number(product.price).toLocaleString()}</span>
                      <span className="product-stock">{product.stock} in stock</span>
                    </div>
                  </div>
                  <div className="product-card-actions">
                    <button className="btn-edit-product" onClick={() => openEditForm(product)}>✏️ Edit</button>
                    <button className="btn-del-product" onClick={() => deleteProduct(product.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-field">
                <label>Product Title *</label>
                <input name="title" value={form.title} onChange={handleFormChange}
                  placeholder="e.g. Engineering Mathematics Book" required />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Price (₱) *</label>
                  <input name="price" type="number" min="0" step="0.01"
                    value={form.price} onChange={handleFormChange}
                    placeholder="0.00" required />
                </div>
                <div className="form-field">
                  <label>Stock Quantity</label>
                  <input name="stock" type="number" min="0"
                    value={form.stock} onChange={handleFormChange}
                    placeholder="0" />
                </div>
              </div>
              <div className="form-field">
                <label>Category *</label>
                <select name="category" value={form.category} onChange={handleFormChange} required>
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange}
                  placeholder="Describe your product..." rows={3} />
              </div>
              <div className="form-field">
                <label>Image URL (optional)</label>
                <input name="image_url" value={form.image_url} onChange={handleFormChange}
                  placeholder="https://..." type="url" />
              </div>
              <div className="form-notice">
                ℹ️ New products will be reviewed by admin before appearing in the store.
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-submit-product" disabled={formLoading}>
                  {formLoading ? <span className="spinner" /> : editProduct ? 'Update Product' : 'Submit Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}