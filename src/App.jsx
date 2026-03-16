import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseclient.js";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [cart, setCart]       = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  // ── Auth listener ────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

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

  // ── Fetch / create profile ───────────────────────────────────────────────
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

      if (data) setProfile(data);
    } catch (err) {
      console.error("fetchProfile error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Cart helpers ─────────────────────────────────────────────────────────
  const addToCart    = (product) => setCart((prev) => [...prev, product]);
  const removeFromCart = (index) => setCart((prev) => prev.filter((_, i) => i !== index));
  const clearCart    = () => setCart([]);

  // ── Auth callbacks ───────────────────────────────────────────────────────
  const handleLogin   = (prof) => { if (prof) setProfile(prof); };
  const handleLogout  = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCart([]);
  };

  // ── Loading splash ───────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a1628",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 16,
        fontFamily: "DM Sans, sans-serif", color: "#475569",
      }}>
        <span style={{ fontSize: 36 }}>🎒</span>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(74,222,128,0.15)",
          borderTopColor: "#4ade80", borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* Protected */}
        <Route path="/dashboard"
          element={!user ? <Navigate to="/" replace /> : (
            <>
              <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
              <Dashboard addToCart={addToCart} cart={cart} />
            </>
          )}
        />
        <Route path="/cart"
          element={!user ? <Navigate to="/" replace /> : (
            <>
              <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
              <Cart cart={cart} onRemove={removeFromCart} />
            </>
          )}
        />
        <Route path="/payment"
          element={!user ? <Navigate to="/" replace /> : (
            <>
              <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
              <Payment cart={cart} onSuccess={clearCart} />
            </>
          )}
        />
        <Route path="/profile"
          element={!user ? <Navigate to="/" replace /> : (
            <>
              <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
              <Profile onProfileUpdate={setProfile} />
            </>
          )}
        />
        <Route path="/settings"
          element={!user ? <Navigate to="/" replace /> : (
            <>
              <Navbar cart={cart} user={profile || user} onLogout={handleLogout} />
              <Settings onLogout={handleLogout} onClearCart={clearCart} />
            </>
          )}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;