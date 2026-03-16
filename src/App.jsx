import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseclient.js";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Cart from "./components/Cart";
import Payment from "./components/Payment";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cart, setCart] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Listen for auth changes ──────────────────────────────────────────────
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setCart([]);
        }
        setAuthLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch or create profile ──────────────────────────────────────────────
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", error);
        setAuthLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error("fetchProfile error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  // ── Auth callbacks ───────────────────────────────────────────────────────
  const handleLogin = (prof) => {
    if (prof) setProfile(prof);
  };

  const handleRegister = () => {
    // After register, auth listener will pick up the session
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCart([]);
  };

  const handlePaymentSuccess = () => {
    clearCart();
  };

  // ── Loading splash ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a1628",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "DM Sans, sans-serif",
        color: "#475569",
      }}>
        <span style={{ fontSize: 36 }}>🎒</span>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(74,222,128,0.15)",
          borderTopColor: "#4ade80",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/register"
          element={
            user
              ? <Navigate to="/dashboard" replace />
              : <Register onRegister={handleRegister} />
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            !user ? <Navigate to="/" replace /> : (
              <>
                <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
                <Dashboard addToCart={addToCart} cart={cart} />
              </>
            )
          }
        />
        <Route
          path="/cart"
          element={
            !user ? <Navigate to="/" replace /> : (
              <>
                <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
                <Cart cart={cart} onRemove={removeFromCart} />
              </>
            )
          }
        />
        <Route
          path="/payment"
          element={
            !user ? <Navigate to="/" replace /> : (
              <>
                <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
                <Payment cart={cart} onSuccess={handlePaymentSuccess} />
              </>
            )
          }
        />
        <Route
          path="/profile"
          element={
            !user ? <Navigate to="/" replace /> : (
              <>
                <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
                <Profile onProfileUpdate={setProfile} />
              </>
            )
          }
        />
        <Route
          path="/settings"
          element={
            !user ? <Navigate to="/" replace /> : (
              <>
                <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
                <Settings onLogout={handleLogout} onClearCart={clearCart} />
              </>
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;