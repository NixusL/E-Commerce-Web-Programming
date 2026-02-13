import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}>
      <div className="modal">
        {children}
      </div>
    </div>
  );
}
