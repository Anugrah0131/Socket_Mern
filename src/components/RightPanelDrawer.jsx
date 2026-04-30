import React, { useEffect } from "react";

/**
 * RightPanelDrawer
 * A premium slide-in drawer for chat, participants, and settings.
 */
export default function RightPanelDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = "400px" 
}) {
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <div className={`drawer-container ${isOpen ? "open" : ""}`} style={{ "--drawer-width": width }}>
      <div className="drawer-overlay" onClick={onClose} />
      
      <div className="drawer-content glass-dark premium-shadow">
        <div className="drawer-header">
          <h3>{title}</h3>
          <button className="drawer-close-btn" onClick={onClose} title="Close Panel">
            ✕
          </button>
        </div>
        
        <div className="drawer-body">
          {children}
        </div>
      </div>
    </div>
  );
}
