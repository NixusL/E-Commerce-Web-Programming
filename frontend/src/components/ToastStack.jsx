import React, { useEffect, useRef, useState } from "react";

function ToastItem({ toast, onUndo, onClose }) {
  const { durationMs = 4500, id } = toast || {};
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(id), 220);
    }, durationMs);
    return () => clearTimeout(timerRef.current);
  }, [durationMs, id, onClose]);

  function handleCloseClick(e) {
    e.stopPropagation();
    setExiting(true);
    setTimeout(() => onClose(toast.id), 220);
  }

  return (
    <div className={"toast-wrap " + (toast.type === "error" ? "toast--error" : "")}> 
      <div className={"toast " + (exiting ? "toast--exit" : "toast--enter")}>
        <span className="toast-msg">{toast.message}</span>
        {toast.undoLabel && toast.canUndo && (
          <button type="button" className="toast-undo" onClick={() => onUndo(toast.id)}>
            {toast.undoLabel}
          </button>
        )}
      </div>
      <button className="toast-close-float" onClick={handleCloseClick}>×</button>
    </div>
  );
}

export default function ToastStack({ toasts = [], onClose = () => {}, onUndo = () => {} }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={onClose} onUndo={onUndo} />
      ))}
    </div>
  );
}
