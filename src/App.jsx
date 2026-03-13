import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import ProductList from "./pages/ProductList";
import ProductUpload from "./pages/ProductUpload";
import SellerDashboard from "./pages/SellerDashboard";

// Pages that have their own full-screen layout (no Navbar)
const HIDE_NAVBAR = ["/", "/register"];

function Layout({ children, cart }) {
  const location = useLocation();
  const hideNav = HIDE_NAVBAR.includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar cart={cart} />}
      <div className={hideNav ? "" : "page-offset"}>
        {children}
      </div>
    </>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const addToCart    = (item)  => setCart(prev => [...prev, item]);
  const removeFromCart = (i)   => setCart(prev => prev.filter((_, idx) => idx !== i));
  const clearCart    = ()      => setCart([]);

  return (
    <Layout cart={cart}>
      <Routes>
        {/* ── Auth ── */}
        <Route
          path="/"
          element={
            <Login
              onLogin={(role) => {
                if (role === "admin")  navigate("/admin");
                else if (role === "seller") navigate("/seller");
                else navigate("/dashboard");
              }}
            />
          }
        />
        <Route
          path="/register"
          element={<Register onRegister={() => navigate("/")} />}
        />

        {/* ── Buyer ── */}
        <Route path="/dashboard" element={<Dashboard addToCart={addToCart} cart={cart} />} />
        <Route path="/cart"      element={<Cart cart={cart} onRemove={removeFromCart} />} />
        <Route path="/payment"   element={<Payment cart={cart} onSuccess={clearCart} />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="/products"  element={<ProductList />} />

        {/* ── Admin ── */}
        <Route path="/admin"          element={<AdminDashboard />} />
        <Route path="/admin/users"    element={<UserManagement />} />
        <Route path="/admin/products" element={<ProductList />} />

        {/* ── Seller ── */}
        <Route path="/seller"        element={<SellerDashboard />} />
        <Route path="/seller/upload" element={<ProductUpload />} />
      </Routes>
    </Layout>
  );
}

export default App;