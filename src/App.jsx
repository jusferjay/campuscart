import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Payment from "./pages/Payment";

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

  const addToCart = (item) => setCart((prev) => [...prev, item]);
  const removeFromCart = (index) => setCart((prev) => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  return (
    <BrowserRouter>
      <Layout cart={cart}>
        <Routes>
          <Route path="/"          element={<Login onLogin={() => window.location.replace("/dashboard")} />} />
          <Route path="/register"  element={<Register onRegister={() => window.location.replace("/dashboard")} />} />
          <Route path="/dashboard" element={<Dashboard addToCart={addToCart} cart={cart} />} />
          <Route path="/cart"      element={<Cart cart={cart} onRemove={removeFromCart} />} />
          <Route path="/payment"   element={<Payment cart={cart} onSuccess={clearCart} />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;