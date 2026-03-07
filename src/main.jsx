import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";   // ⭐ added
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  render() {
    if (this.state.crashed) {
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0a1628",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
          gap: "12px",
          color: "#475569",
        }}>
          <span style={{ fontSize: "40px" }}>🎒</span>
          <p style={{ fontSize: "18px", fontWeight: 700, color: "#e2e8f0" }}>
            Something went wrong
          </p>
          <p style={{ fontSize: "14px" }}>
            Try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "8px",
              padding: "10px 24px",
              borderRadius: "10px",
              border: "1px solid rgba(74,222,128,0.3)",
              background: "rgba(74,222,128,0.1)",
              color: "#4ade80",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>  
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);