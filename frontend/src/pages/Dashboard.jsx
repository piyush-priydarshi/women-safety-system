import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPanel from '../components/UserPanel';
import SosSystem from '../components/SosSystem';
import ContactsPanel from '../components/ContactsPanel';
import ActivityLog from '../components/ActivityLog';
import LocationPanel from '../components/LocationPanel';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [{ id: Date.now() + Math.random(), message, type, timestamp }, ...prev].slice(0, 50));
  };

  if (!user) return <div style={{ color: 'var(--neon-blue)', padding: '2rem' }}>Loading system...</div>;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 350px',
      gap: '2rem',
      padding: '2rem',
      maxWidth: '1600px',
      margin: '0 auto',
      minHeight: '100vh',
    }}>
      
      {/* LEFT COLUMN: Main Interaction */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Header / User Panel */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <UserPanel user={user} systemState={systemState} onLogout={handleLogout} />
          <LocationPanel />
        </header>

        {/* SOS Center */}
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '400px'
        }}>
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
        </main>
        
      </div>

      {/* RIGHT COLUMN: Data & Logs */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <ContactsPanel 
          onContactAdded={(name) => addLog(`CONTACT ADDED: ${name}`, 'success')} 
          onContactRemoved={(name) => addLog(`CONTACT REMOVED: ${name}`, 'danger')}
        />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
          <ActivityLog logs={logs} systemState={systemState} />
        </div>

      </aside>

    </div>
  );
}
