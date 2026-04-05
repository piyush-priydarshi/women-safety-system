import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPanel from '../components/UserPanel';
import SosSystem from '../components/SosSystem';
import ContactsPanel from '../components/ContactsPanel';
import ActivityLog from '../components/ActivityLog';
import LocationPanel from '../components/LocationPanel';
import ToastContainer from '../components/ToastContainer';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [systemState, setSystemState] = useState('NORMAL'); // 'NORMAL' | 'ALERT'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
    
    addLog('SYSTEM INITIALIZED');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/auth');
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    // Only keep the most recent toast
    setToasts([{ id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addLog = (message, type = 'info') => {
    // Clean old emojis if present to avoid doubling
    let cleanMessage = message.replace(/^(📍|📩|🚓|⚠|✅|🚨|📞|⚙️)\s*/, '');
    if (message === '[NO_CONTACTS_FOUND]') cleanMessage = 'NO CONTACTS FOUND';

    let icon = 'ℹ️';
    const lower = cleanMessage.toLowerCase();
    if (lower.includes('location') || lower.includes('geo')) icon = '📍';
    else if (lower.includes('sos') || lower.includes('emergency')) icon = '🚨';
    else if (lower.includes('alert') || lower.includes('authorities') || lower.includes('contact')) icon = '📞';
    else if (cleanMessage === 'SYSTEM INITIALIZED') icon = '⚙️';

    const displayMessage = `${icon} ${cleanMessage}`;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: Date.now() + Math.random(), message: displayMessage, type, timestamp }, ...prev].slice(0, 50));

    if (cleanMessage === 'SOS TRIGGERED - SEQUENCE INITIATED') {
      addToast('🚨 SOS Activated', 'danger');
    } else if (
      cleanMessage.includes('Authorities notified') || 
      cleanMessage.includes('SOS cancelled')
    ) {
      addToast(displayMessage, type);
    }
  };

  if (!user) return <div style={{ color: 'var(--neon-blue)', padding: '2rem' }}>Loading system...</div>;

  return (
    <div className="dashboard-wrapper">
      {/* Red Glow Overlay for EMERGENCY MODE */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: systemState === 'ALERT' ? 'radial-gradient(circle at center, transparent 0%, rgba(255, 0, 60, 0.15) 100%)' : 'none',
        boxShadow: systemState === 'ALERT' ? 'inset 0 0 150px rgba(255, 0, 60, 0.4)' : 'none',
        pointerEvents: 'none',
        zIndex: -1,
        transition: 'all 0.5s ease',
        opacity: systemState === 'ALERT' ? 1 : 0
      }} />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* TOP ROW: Responsive Dashboard Cards */}
      <div className="dashboard-top-row">
        <UserPanel user={user} systemState={systemState} onLogout={handleLogout} />
        <LocationPanel />
        <ContactsPanel 
          onContactAdded={(name) => addLog(`CONTACT ADDED: ${name}`, 'success')} 
          onContactRemoved={(name) => addLog(`CONTACT REMOVED: ${name}`, 'danger')}
        />
      </div>

      {/* BOTTOM ROW: Centered SOS Block & Activity Log */}
      <div className="dashboard-bottom-row">
        
        {/* SOS Center */}
        <main className="dashboard-sos-main">
          <div className="sos-container">
            <SosSystem 
            onTrigger={() => {
              addLog('SOS TRIGGERED - SEQUENCE INITIATED', 'danger');
              setSystemState('ALERT');
            }} 
            onCancel={() => {
              setSystemState('NORMAL');
            }}
            onLog={addLog}
            onError={(err) => {
              addLog(`SOS FAILED: ${err}`, 'danger');
            }}
          />
          </div>
        </main>

        {/* RIGHT COLUMN: Logs */}
        <aside className="dashboard-logs-aside">
          <ActivityLog logs={logs} systemState={systemState} />
        </aside>

      </div>

    </div>
  );
}
