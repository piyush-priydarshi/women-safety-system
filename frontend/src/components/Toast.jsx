import React, { useEffect, useState } from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300); // Let animation finish before unmounting
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'danger': return <AlertTriangle size={18} />;
      case 'success': return <CheckCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  const getColor = () => {
    switch (toast.type) {
      case 'danger': return 'var(--danger)';
      case 'success': return '#00ff88';
      default: return 'var(--neon-blue)';
    }
  };

  return (
    <div 
      className={`toast ${isLeaving ? 'toast-leave' : 'toast-enter'}`} 
      style={{
        borderLeft: `3px solid ${getColor()}`,
        color: getColor(),
        boxShadow: `0 0 10px rgba(0,0,0,0.5), inset 0 0 5px ${getColor()}40`
      }}
    >
      {getIcon()}
      <span style={{ fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }}>
        {toast.message}
      </span>
    </div>
  );
}
