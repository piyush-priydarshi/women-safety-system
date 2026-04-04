import React, { useState, useEffect } from 'react';
import { MapPin, Activity } from 'lucide-react';

export default function LocationPanel() {
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 });
  const [driftDot, setDriftDot] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0005,
        lng: prev.lng + (Math.random() - 0.5) * 0.0005
      }));
      setDriftDot(d => !d);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="terminal-card" style={{ padding: '1rem', minWidth: '250px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--neon-blue)' }}>
        <MapPin size={16} />
        <span style={{ fontSize: '0.85rem', fontFamily: 'Orbitron' }}>GEO.TRACKER</span>
        <Activity size={14} className="text-blue" style={{ marginLeft: 'auto', opacity: driftDot ? 1 : 0.5, transition: 'opacity 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="text-dim">LAT:</span> 
          <span style={{ transition: 'color 0.3s ease', color: driftDot ? 'var(--text-primary)' : 'var(--neon-blue)' }}>
            {Math.abs(coords.lat).toFixed(4)}° {coords.lat >= 0 ? 'N' : 'S'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="text-dim">LNG:</span> 
          <span style={{ transition: 'color 0.3s ease', color: !driftDot ? 'var(--text-primary)' : 'var(--neon-blue)' }}>
            {Math.abs(coords.lng).toFixed(4)}° {coords.lng >= 0 ? 'E' : 'W'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--neon-purple)' }}>
          <span className="text-dim" style={{ fontSize: '0.75rem' }}>STATUS:</span> 
          <span style={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 5px #00ff88', animation: 'alertPulse 2s infinite' }}></span>
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
}
