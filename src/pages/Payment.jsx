import { useState } from "react";
import { Link } from "react-router-dom";
import "./Payment.css";

const PAYMENT_METHODS = [
  { id: "gcash",    label: "GCash",        emoji: "📱", desc: "Pay via GCash mobile wallet" },
  { id: "maya",     label: "Maya",         emoji: "💳", desc: "Pay via Maya digital wallet" },
  { id: "cod",      label: "Cash on Delivery", emoji: "💵", desc: "Pay when your order arrives" },
  { id: "bank",     label: "Bank Transfer", emoji: "🏦", desc: "Transfer via online banking" },
];

function Payment({ cart = [], onSuccess }) {
  const [method, setMethod]     = useState("");
  const [step, setStep]         = useState("review");   // review | form | success
  const [loading, setLoading]   = useState(false);
  const [refNum]                = useState(() =>
    "CC-" + Math.random().toString(36).slice(2, 8).toUpperCase()
  );
  const [error, setError]       = useState("");

  // GCash / Maya form fields
  const [mobileNum, setMobileNum] = useState("");
  // Bank transfer
  const [accountNum, setAccountNum] = useState("");
  // COD — no extra fields

  const total    = cart.reduce((sum, item) => sum + item.price, 0);
  const itemCount = cart.length;

  const handleProceed = () => {
    if (!method) { setError("Please select a payment method."); return; }
    setError("");
    setStep("form");
  };

  const handleConfirm = () => {
    if ((method === "gcash" || method === "maya") && mobileNum.replace(/\D/g, "").length < 11) {
      setError("Enter a valid 11-digit mobile number."); return;
    }
    if (method === "bank" && accountNum.replace(/\D/g, "").length < 10) {
      setError("Enter a valid account number."); return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      onSuccess?.();
    }, 1600);
  };

  /* ── Success Screen ── */
  if (step === "success") {
    return (
      <div className="payment-page">
        <div className="payment-card success-card">
          <div className="success-ring">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="success-title">Payment Successful!</h2>
          <p className="success-sub">Your order has been placed and is being processed.</p>

          <div className="success-details">
            <div className="success-row"><span>Reference No.</span><span className="mono">{refNum}</span></div>
            <div className="success-row"><span>Method</span><span>{PAYMENT_METHODS.find(m => m.id === method)?.label}</span></div>
            <div className="success-row"><span>Items</span><span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span></div>
            <div className="success-row total-row"><span>Total Paid</span><span>₱{total.toLocaleString()}</span></div>
          </div>

          <Link to="/dashboard" className="back-store-btn">Back to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">

        {/* Header */}
        <div className="payment-header">
          <h1 className="payment-title">Checkout</h1>
          <p className="payment-sub">{itemCount} item{itemCount !== 1 ? "s" : ""} · ₱{total.toLocaleString()}</p>
        </div>

        {/* Step: Review + Method */}
        {step === "review" && (
          <>
            {/* Order Summary */}
            <div className="order-summary">
              <p className="section-label">Order Summary</p>
              <div className="order-items">
                {cart.length === 0 ? (
                  <p className="empty-cart-note">Your cart is empty. <Link to="/dashboard">Browse store →</Link></p>
                ) : cart.map((item, i) => (
                  <div key={i} className="order-item">
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-price">₱{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="order-total-row">
                <span>Total</span>
                <span className="order-total-amt">₱{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="method-section">
              <p className="section-label">Payment Method</p>
              <div className="method-grid">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    className={`method-card ${method === m.id ? "active" : ""}`}
                    onClick={() => { setMethod(m.id); setError(""); }}
                  >
                    <span className="method-emoji">{m.emoji}</span>
                    <span className="method-label">{m.label}</span>
                    <span className="method-desc">{m.desc}</span>
                  </button>
                ))}
              </div>
              {error && <p className="pay-error">{error}</p>}
            </div>

            <button
              className="pay-btn"
              onClick={handleProceed}
              disabled={cart.length === 0}
            >
              Proceed to Payment
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </>
        )}

        {/* Step: Payment Form */}
        {step === "form" && (
          <>
            <div className="selected-method-banner">
              <span>{PAYMENT_METHODS.find(m => m.id === method)?.emoji}</span>
              <span>Paying via <strong>{PAYMENT_METHODS.find(m => m.id === method)?.label}</strong></span>
            </div>

            {(method === "gcash" || method === "maya") && (
              <div className="form-section">
                <p className="section-label">Mobile Number</p>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                  </svg>
                  <input
                    className="pay-input"
                    type="tel"
                    placeholder="09XXXXXXXXX"
                    maxLength={11}
                    value={mobileNum}
                    onChange={e => { setMobileNum(e.target.value); setError(""); }}
                  />
                </div>
                <p className="input-hint">Enter the mobile number linked to your {method === "gcash" ? "GCash" : "Maya"} account.</p>
              </div>
            )}

            {method === "bank" && (
              <div className="form-section">
                <p className="section-label">Account Number</p>
                <div className="input-wrap">
                  <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  <input
                    className="pay-input"
                    type="text"
                    placeholder="Account number"
                    value={accountNum}
                    onChange={e => { setAccountNum(e.target.value); setError(""); }}
                  />
                </div>
                <p className="input-hint">Transfer to: <strong>BDO · CampusCart Inc. · 0012-3456-7890</strong></p>
              </div>
            )}

            {method === "cod" && (
              <div className="cod-note">
                <span>💵</span>
                <div>
                  <p className="cod-title">Cash on Delivery</p>
                  <p className="cod-sub">Prepare <strong>₱{total.toLocaleString()}</strong> in exact change upon delivery to your campus address.</p>
                </div>
              </div>
            )}

            {error && <p className="pay-error">{error}</p>}

            <div className="form-actions">
              <button className="back-btn" onClick={() => { setStep("review"); setError(""); }}>← Back</button>
              <button
                className={`pay-btn flex1 ${loading ? "loading" : ""}`}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading
                  ? <span className="spinner" />
                  : <>Confirm Payment · ₱{total.toLocaleString()}</>
                }
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Payment;