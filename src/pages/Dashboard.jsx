import { useState } from "react";
import "./Dashboard.css";

const products = [
  { id: 1,  name: "Ballpen Set",          price: 85,   category: "Writing",    emoji: "🖊️", stock: 50 },
  { id: 2,  name: "Spiral Notebook",      price: 120,  category: "Paper",      emoji: "📓", stock: 30 },
  { id: 3,  name: "Scientific Calculator",price: 850,  category: "Math",       emoji: "🔢", stock: 8  },
  { id: 4,  name: "Highlighter Pack",     price: 155,  category: "Writing",    emoji: "🖍️", stock: 25 },
  { id: 5,  name: "Ruler & Compass Set",  price: 210,  category: "Math",       emoji: "📐", stock: 14 },
  { id: 6,  name: "Folder Organizer",     price: 175,  category: "Organizers", emoji: "📁", stock: 20 },
  { id: 7,  name: "Sticky Notes Pack",    price: 95,   category: "Paper",      emoji: "🗒️", stock: 40 },
  { id: 8,  name: "Pencil Case",          price: 230,  category: "Organizers", emoji: "🎒", stock: 5  },
  { id: 9,  name: "Index Cards",          price: 60,   category: "Paper",      emoji: "📇", stock: 60 },
  { id: 10, name: "Correction Tape",      price: 75,   category: "Writing",    emoji: "📝", stock: 35 },
  { id: 11, name: "Coloring Pencils",     price: 320,  category: "Art",        emoji: "🎨", stock: 18 },
  { id: 12, name: "Glue & Scissors Kit",  price: 145,  category: "Art",        emoji: "✂️", stock: 3  },
];

const categories = ["All", ...new Set(products.map(p => p.category))];

function Dashboard({ addToCart, cart = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [addedIds, setAddedIds] = useState(new Set());

  const cartIds = new Set(cart.map(i => i.id));

  const filtered = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAdd = (product) => {
    addToCart?.(product);
    setAddedIds(prev => new Set([...prev, product.id]));
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">

        {/* Hero Header */}
        <div className="store-hero">
          <div className="hero-text">
            <h1 className="store-title">Campus<em>Cart</em> Store</h1>
            <p className="store-sub">Everything you need for the school year — all in one place.</p>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">{products.length}</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">{cart.length}</span>
              <span className="stat-label">In Cart</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-bar">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filtered.map((product, index) => {
            const inCart = cartIds.has(product.id);
            const justAdded = addedIds.has(product.id);
            const lowStock = product.stock <= 5;

            return (
              <div
                key={product.id}
                className="product-card"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {lowStock && (
                  <span className="stock-badge">Only {product.stock} left</span>
                )}

                <div className="product-emoji">{product.emoji}</div>

                <div className="product-body">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">₱{product.price.toLocaleString()}</p>
                </div>

                <button
                  className={`add-btn ${inCart ? "in-cart" : ""} ${justAdded ? "just-added" : ""}`}
                  onClick={() => handleAdd(product)}
                  disabled={justAdded}
                >
                  {justAdded ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Added!
                    </>
                  ) : inCart ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                      Add Again
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}



export default Dashboard;