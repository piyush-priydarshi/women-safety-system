import React, { useState, useEffect } from 'react';
import { MapPin, Activity } from 'lucide-react';
import { api } from '../api';

export default function LocationPanel() {
  const [coords, setCoords] = useState({ lat: 0, lng: 0 });
  const [status, setStatus] = useState("LOCATING..."); // ACTIVE | NO SIGNAL | LOCATING...
  const [driftDot, setDriftDot] = useState(true);

  // Pulse animation for the dot and text colors
  useEffect(() => {
    const dotInterval = setInterval(() => setDriftDot(d => !d), 1000);
    return () => clearInterval(dotInterval);
  }, []);

  useEffect(() => {
    let watchId;
    
    const sendLocation = async (lat, lng) => {
      try {
        await api.updateLocation({ lat, lng });
      } catch (err) {
        console.error("Failed to update location to backend", err);
      }
    };

    if ("geolocation" in navigator) {
      // Get initial position quickly
      navigator.geolocation.getCurrentPosition(
        position => {
          setStatus("ACTIVE");
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          sendLocation(position.coords.latitude, position.coords.longitude);
        },
        error => {
          setStatus("NO SIGNAL");
          console.error("Geolocation error:", error);
        }
      );

      // Watch continuously
      watchId = navigator.geolocation.watchPosition(
        position => {
          setStatus("ACTIVE");
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          sendLocation(position.coords.latitude, position.coords.longitude);
        },
        error => {
          setStatus("NO SIGNAL");
          console.error("Geolocation watch error:", error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    } else {
      setStatus("NO SIGNAL");
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <div className="terminal-card" style={{ padding: '1rem', minWidth: '250px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--neon-blue)' }}>
        <MapPin size={16} />
        <span style={{ fontSize: '0.85rem', fontFamily: 'Orbitron' }}>GEO.TRACKER</span>
        <Activity size={14} className="text-blue" style={{ marginLeft: 'auto', opacity: driftDot && status === 'ACTIVE' ? 1 : 0.5, transition: 'opacity 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="text-dim">LAT:</span> 
          <span style={{ transition: 'color 0.3s ease', color: driftDot && status === 'ACTIVE' ? 'var(--text-primary)' : 'var(--neon-blue)' }}>
            {Math.abs(coords.lat).toFixed(4)}° {coords.lat >= 0 ? 'N' : 'S'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="text-dim">LNG:</span> 
          <span style={{ transition: 'color 0.3s ease', color: !driftDot && status === 'ACTIVE' ? 'var(--text-primary)' : 'var(--neon-blue)' }}>
            {Math.abs(coords.lng).toFixed(4)}° {coords.lng >= 0 ? 'E' : 'W'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--neon-purple)' }}>
          <span className="text-dim" style={{ fontSize: '0.75rem' }}>STATUS:</span> 
          <span style={{ 
            color: status === 'ACTIVE' ? '#00ff88' : (status === 'NO SIGNAL' ? 'var(--danger)' : 'var(--neon-blue)'), 
            display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 'bold' 
          }}>
            <span style={{ 
              width: '6px', height: '6px', borderRadius: '50%', 
              background: status === 'ACTIVE' ? '#00ff88' : (status === 'NO SIGNAL' ? 'var(--danger)' : 'var(--neon-blue)'), 
              boxShadow: `0 0 5px ${status === 'ACTIVE' ? '#00ff88' : (status === 'NO SIGNAL' ? 'var(--danger)' : 'var(--neon-blue)')}`, 
              animation: status === 'ACTIVE' ? 'alertPulse 2s infinite' : 'none' 
            }}></span>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
