import React from 'react';
import Toast from './Toast';

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div 
      className="toast-container" 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        pointerEvents: 'none' // Ensures users can still click things underneath
      }}
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}
