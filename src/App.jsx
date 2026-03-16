import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "./supabase.js";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Payment from "./pages/Payment";

const HIDE_NAVBAR = ["/", "/register"];

function Layout({ children, cart, user, onLogout }) {
  const location = useLocation();
  const hideNav = HIDE_NAVBAR.includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar cart={cart} user={user} onLogout={onLogout} />}
      <div className={hideNav ? "" : "page-offset"}>
        {children}
      </div>
    </>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      }
      setLoadingSession(false);
    };
    loadSession();
  }, []);

  const addToCart = (item) => setCart((prev) => [...prev, item]);
  const removeFromCart = (index) =>
    setCart((prev) => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  if (loadingSession) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Layout cart={cart} user={user} onLogout={handleLogout}>
      <Routes>
        <Route
          path="/"
          element={<Login onLogin={handleLogin} />}
        />

        <Route
          path="/register"
          element={<Register onRegister={handleLogin} />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard addToCart={addToCart} cart={cart} />}
        />

        <Route
          path="/cart"
          element={<Cart cart={cart} onRemove={removeFromCart} />}
        />

        <Route
          path="/payment"
          element={<Payment cart={cart} onSuccess={clearCart} />}
        />

        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/settings" element={<Settings user={user} />} />
      </Routes>
    </Layout>
  );
}

export default App;