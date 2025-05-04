// src/components/ThirdPage.jsx
import React from "react";

export default function ThirdPage({ onPreviousPage }) {
  return (
    /*  ❶ fill the viewport (position: fixed + inset: 0)  */
    <div style={{ position: "fixed", inset: 0 }}>

      {/* back-button – keeps its absolute positioning */}
      <button
        onClick={onPreviousPage}
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 50,
          padding: "8px 18px",
          borderRadius: 8,
          border: 0,
          fontWeight: 600,
          background: "#6b7280",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Previous
      </button>

      {/*  ❷ iframe now fills the same fixed container  */}
      <iframe
        src="/third-page.html"
        title="Quiz"
        style={{
          border: "none",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
