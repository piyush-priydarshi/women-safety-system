import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [data, setData] = useState({ users: [], contacts: [], sos_events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
        const response = await fetch(`${baseUrl}/api/admin/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch admin data or unauthorized');
        }
        
        const result = await response.json();
        if (result.status === 'success') {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Invalid API response format');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="text-neon-blue typewriter-text">WAIT_LOADING_ADMIN_DATA...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrapper">
        <div className="terminal-card terminal-card-danger">
          <h2 className="text-danger">[!] ERROR_ACCESS_DENIED</h2>
          <p>{error}</p>
          <button className="cyber-button" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
            RETURN_TO_BASE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-pink">&gt; SYSTEM_ADMIN_PANEL_</h1>
        <button className="cyber-button" onClick={() => navigate('/')}>
          BACK_TO_DASHBOARD
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* USERS LOG */}
        <div className="terminal-card" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <h2 className="text-blue" style={{ borderBottom: '1px solid var(--neon-blue)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            [ REGISTERED_USERS ]
          </h2>
          {data.users.length === 0 ? (
            <p className="text-dim">NO_USERS_FOUND</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.users.map(u => (
                <div key={u.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-primary)' }}>ID_{u.id} | {u.name}</span>
                    <span className="text-blue">{u.phone}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                    SINCE: {u.created_at}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SOS EVENTS LOG */}
        <div className="terminal-card terminal-card-danger" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <h2 className="text-danger" style={{ borderBottom: '1px solid var(--danger)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            [ SOS_EVENT_LOGS ]
          </h2>
          {data.sos_events.length === 0 ? (
            <p className="text-dim">NO_SOS_EVENTS_RECORDED</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.sos_events.map(ev => (
                <div key={ev.id} style={{ borderLeft: `3px solid ${ev.status === 'active' ? 'var(--danger)' : 'var(--neon-blue)'}`, background: 'rgba(255,0,60,0.05)', padding: '0.75rem', borderRadius: '0 4px 4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: ev.status === 'active' ? 'var(--danger)' : 'var(--neon-blue)', fontWeight: 'bold' }}>
                      EVENT_{ev.id} [{ev.status.toUpperCase()}]
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>UID_{ev.user_id}</span>
                  </div>
                  <div style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                    {ev.address || `LAT: ${ev.latitude.toFixed(4)}, LNG: ${ev.longitude.toFixed(4)}`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    TIME: {ev.triggered_at}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CONTACTS LOG */}
        <div className="terminal-card terminal-card-pink" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <h2 className="text-pink" style={{ borderBottom: '1px solid var(--neon-pink)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            [ EMERGENCY_CONTACTS ]
          </h2>
          {data.contacts.length === 0 ? (
            <p className="text-dim">NO_CONTACTS_FOUND</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.contacts.map(c => (
                <div key={c.id} style={{ borderLeft: '2px solid var(--neon-pink)', padding: '0.5rem 0.75rem', background: 'rgba(247,37,133,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{c.name} ({c.relation})</span>
                    <span className="text-pink">{c.phone}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
                    OWNER_UID: {c.user_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
