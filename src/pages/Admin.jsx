import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import './Admin.css'

export default function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentUser, setCurrentUser] = useState(null)
  const [stats, setStats] = useState({ users: 0, sellers: 0, products: 0, pending: 0 })
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchAll()
    }
  }, [currentUser])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return navigate('/login')

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()

    if (!profile || profile.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    setCurrentUser(profile)
  }

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchUsers(), fetchProducts()])
    setLoading(false)
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setUsers(data)
      setStats(prev => ({
        ...prev,
        users: data.filter(u => u.role === 'buyer').length,
        sellers: data.filter(u => u.role === 'seller').length,
      }))
    }
  }

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    if (data) {
      setProducts(data)
      setStats(prev => ({
        ...prev,
        products: data.length,
        pending: data.filter(p => !p.is_approved).length,
      }))
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId)
    if (!error) {
      fetchUsers()
      showToast(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user? This cannot be undone.')) return
    const { error } = await supabase.from('profiles').delete().eq('id', userId)
    if (!error) {
      fetchUsers()
      showToast('User deleted successfully')
    } else {
      showToast('Error deleting user', 'error')
    }
  }

  const approveProduct = async (productId) => {
    const { error } = await supabase
      .from('products')
      .update({ is_approved: true })
      .eq('id', productId)
    if (!error) {
      fetchProducts()
      showToast('Product approved!')
    }
  }

  const deleteProduct = async (productId) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (!error) {
      fetchProducts()
      showToast('Product deleted')
    } else {
      showToast('Error deleting product', 'error')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return (
    <div className="admin-loading">
      <div className="loading-spinner" />
      <p>Loading CampusCart Admin...</p>
    </div>
  )

  const sellers = users.filter(u => u.role === 'seller')
  const buyers = users.filter(u => u.role === 'buyer')

  return (
    <div className="admin-page">
      {/* TOAST */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🛒</span>
          <div>
            <div className="logo-name">CampusCart</div>
            <div className="logo-role">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section">Dashboard</span>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'sellers', icon: '🏪', label: 'Sellers', count: stats.sellers },
            { id: 'buyers', icon: '🧑‍🎓', label: 'Buyers', count: stats.users },
            { id: 'products', icon: '📦', label: 'Products', count: stats.pending > 0 ? `${stats.pending} pending` : null },
          ].map(item => (
            <button
              key={item.id}
              className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.count && <span className="nav-count">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{currentUser?.full_name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="admin-uname">{currentUser?.full_name}</div>
              <div className="admin-uemail">{currentUser?.email}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="page-title">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'sellers' && 'Seller Management'}
              {activeTab === 'buyers' && 'Buyer Management'}
              {activeTab === 'products' && 'Product Management'}
            </h1>
            <p className="page-sub">
              {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="stats-grid">
              <div className="stat-card green">
                <div className="stat-icon">🏪</div>
                <div className="stat-val">{stats.sellers}</div>
                <div className="stat-label">Total Sellers</div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon">🧑‍🎓</div>
                <div className="stat-val">{stats.users}</div>
                <div className="stat-label">Total Buyers</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-icon">📦</div>
                <div className="stat-val">{stats.products}</div>
                <div className="stat-label">Total Products</div>
              </div>
              <div className="stat-card red">
                <div className="stat-icon">⏳</div>
                <div className="stat-val">{stats.pending}</div>
                <div className="stat-label">Pending Approval</div>
              </div>
            </div>

            {/* PENDING PRODUCTS */}
            {products.filter(p => !p.is_approved).length > 0 && (
              <div className="section-card">
                <div className="section-header">
                  <h3>⏳ Pending Product Approvals</h3>
                  <span className="badge-count">{products.filter(p => !p.is_approved).length}</span>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th><th>Seller</th><th>Price</th><th>Category</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.filter(p => !p.is_approved).map(product => (
                        <tr key={product.id}>
                          <td><strong>{product.title}</strong></td>
                          <td>{product.profiles?.full_name}</td>
                          <td>₱{Number(product.price).toLocaleString()}</td>
                          <td><span className="tag">{product.category}</span></td>
                          <td>
                            <div className="action-btns">
                              <button className="btn-approve" onClick={() => approveProduct(product.id)}>✅ Approve</button>
                              <button className="btn-del" onClick={() => deleteProduct(product.id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* RECENT USERS */}
            <div className="section-card">
              <div className="section-header">
                <h3>👥 Recent Users</h3>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.full_name}</strong></td>
                        <td>{user.email}</td>
                        <td><span className={`role-tag ${user.role}`}>{user.role}</span></td>
                        <td><span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── SELLERS ── */}
        {activeTab === 'sellers' && (
          <div className="section-card">
            <div className="section-header">
              <h3>🏪 All Sellers ({sellers.length})</h3>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {sellers.length === 0 ? (
                    <tr><td colSpan={5} className="empty-row">No sellers registered yet</td></tr>
                  ) : sellers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar seller">{user.full_name?.[0]}</div>
                          <strong>{user.full_name}</strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            className={user.is_active ? 'btn-suspend' : 'btn-activate'}
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? '🔒 Suspend' : '🔓 Activate'}
                          </button>
                          <button className="btn-del" onClick={() => deleteUser(user.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── BUYERS ── */}
        {activeTab === 'buyers' && (
          <div className="section-card">
            <div className="section-header">
              <h3>🧑‍🎓 All Buyers ({buyers.length})</h3>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {buyers.length === 0 ? (
                    <tr><td colSpan={5} className="empty-row">No buyers registered yet</td></tr>
                  ) : buyers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar buyer">{user.full_name?.[0]}</div>
                          <strong>{user.full_name}</strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-dot ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-btns">
                          <button
                            className={user.is_active ? 'btn-suspend' : 'btn-activate'}
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? '🔒 Suspend' : '🔓 Activate'}
                          </button>
                          <button className="btn-del" onClick={() => deleteUser(user.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {activeTab === 'products' && (
          <div className="section-card">
            <div className="section-header">
              <h3>📦 All Products ({products.length})</h3>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Product</th><th>Seller</th><th>Price</th><th>Category</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={6} className="empty-row">No products yet</td></tr>
                  ) : products.map(product => (
                    <tr key={product.id}>
                      <td><strong>{product.title}</strong></td>
                      <td>{product.profiles?.full_name}</td>
                      <td>₱{Number(product.price).toLocaleString()}</td>
                      <td><span className="tag">{product.category}</span></td>
                      <td>
                        <span className={`status-dot ${product.is_approved ? 'active' : 'pending'}`}>
                          {product.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          {!product.is_approved && (
                            <button className="btn-approve" onClick={() => approveProduct(product.id)}>✅ Approve</button>
                          )}
                          <button className="btn-del" onClick={() => deleteProduct(product.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}