import React, { useEffect, useRef } from 'react';
import { AlignLeft } from 'lucide-react';

export default function ActivityLog({ logs, systemState }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getColor = (type) => {
    switch (type) {
      case 'danger': return 'var(--danger)';
      case 'success': return '#00ff88';
      default: return 'var(--text-dim)';
    }
  };

  return (
    <div className={`terminal-card ${systemState === 'ALERT' ? 'terminal-card-danger' : 'terminal-card-pink'}`} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: `1px solid ${systemState === 'ALERT' ? 'var(--danger)' : 'var(--neon-pink)'}`, paddingBottom: '0.5rem' }}>
        <AlignLeft size={18} className={systemState === 'ALERT' ? 'text-danger' : 'text-pink'} />
        <h3 style={{ margin: 0, color: systemState === 'ALERT' ? 'var(--danger)' : 'var(--neon-pink)', fontSize: '1rem' }}>
          SYS.ACTIVITY_LOG
        </h3>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column-reverse', 
          gap: '0.5rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.8rem'
        }}
      >
        {logs.map((log, i) => (
          <div key={log.id} className="fade-in" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <span className="text-dim fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>[{log.timestamp}]</span>
            <span style={{ color: getColor(log.type), flex: 1 }}>
              &gt; <span className={i === 0 ? "typewriter-text" : ""} style={{ whiteSpace: i === 0 ? 'nowrap' : 'normal', display: i === 0 ? 'inline-block' : 'inline' }}>
                {log.message}
                {i === 0 && <span style={{ borderRight: `2px solid ${getColor(log.type)}`, animation: 'blinkCursor 1s step-end infinite', paddingRight: '2px', marginLeft: '2px' }}></span>}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
