import React from 'react';

function Popup({ message, onClose, onConfirm }) {
  // If there is no message, don't show the pop-up at all
  if (!message) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <p>{message}</p>
        <button onClick={onConfirm || onClose} className="btn-primary">
          Okay
        </button>
      </div>
    </div>
  );
}

export default Popup;