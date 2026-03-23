// G360DragModal - Placeholder component
import React from 'react';

export default function G360DragModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="g360-modal-overlay" onClick={onClose}>
      <div className="g360-modal-content" onClick={e => e.stopPropagation()}>
        <button className="g360-modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
