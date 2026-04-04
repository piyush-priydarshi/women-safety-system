import React from 'react';
import { User, LogOut, Terminal, Activity } from 'lucide-react';

export default function UserPanel({ user, systemState, onLogout }) {
  return (
    <div className={`terminal-card ${systemState === 'ALERT' ? 'terminal-card-danger' : ''}`} style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: `1px solid ${systemState === 'ALERT' ? 'var(--danger)' : 'var(--neon-blue)'}`, paddingBottom: '0.5rem' }}>
        <Terminal size={18} className={systemState === 'ALERT' ? 'text-danger' : 'text-blue'} />
        <h3 style={{ margin: 0, color: systemState === 'ALERT' ? 'var(--danger)' : 'var(--neon-blue)', fontSize: '1rem' }}>
          SYS.USER_DATA
        </h3>
        {systemState === 'ALERT' && (
          <Activity className="text-danger" size={18} style={{ marginLeft: 'auto', animation: 'pulse 1s infinite' }} />
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="text-dim">ID:</span>
          <span style={{ color: 'var(--text-primary)' }}>{user.name || 'UNKNOWN_ENTITY'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="text-dim">COM:</span>
          <span style={{ color: 'var(--text-primary)' }}>{user.phone || 'NO_COM_LINK'}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="text-dim">STATE:</span>
          <span style={{ 
            color: systemState === 'ALERT' ? 'var(--danger)' : '#00ff88',
            textShadow: systemState === 'ALERT' ? '0 0 5px var(--danger)' : '0 0 5px #00ff88'
          }}>
            {systemState === 'ALERT' ? 'CRITICAL_ALERT' : 'NOMINAL'}
          </span>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="cyber-button"
        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <LogOut size={14} /> TERMINATE_SESSION
      </button>
    </div>
  );
}
