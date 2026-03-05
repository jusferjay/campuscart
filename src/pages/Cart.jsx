import "./Cart.css";
import { Link } from "react-router-dom";

function Cart({ cart = [], onRemove }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const itemCount = cart.length;

  return (
    <div className="cart-page">
      <div className="cart-wrapper">

        {/* Header */}
        <div className="cart-header">
          <div>
            <h1 className="cart-title">Your Cart</h1>
            <p className="cart-subtitle">
              {itemCount === 0 ? "Nothing here yet" : `${itemCount} item${itemCount !== 1 ? "s" : ""} ready to checkout`}
            </p>
          </div>
          {itemCount > 0 && (
            <span className="cart-count-pill">{itemCount}</span>
          )}
        </div>

        {/* Empty State */}
        {itemCount === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon">🛒</div>
            <p className="empty-title">Your cart is empty</p>
            <p className="empty-sub">Head to the store and add some items!</p>
            <Link to="/dashboard" className="browse-btn">Browse Store</Link>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="cart-list">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="cart-item"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="item-left">
                    <div className="item-avatar">
                      {item.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      {item.category && (
                        <span className="item-category">{item.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="item-right">
                    <span className="item-price">₱{item.price.toLocaleString()}</span>
                    {onRemove && (
                      <button
                        className="remove-btn"
                        onClick={() => onRemove(index)}
                        aria-label="Remove item"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
              <div className="summary-row muted">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>

              <Link to="/payment" className="checkout-btn">
                Proceed to Checkout
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>

              <Link to="/dashboard" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;