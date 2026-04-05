import React, { useState, useEffect } from 'react';
import { MapPin, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../api';

// Create custom neon pulse icon for the map marker
const neonIcon = L.divIcon({
  className: 'custom-neon-marker',
  html: '<div class="neon-pulse-ring"></div><div class="neon-pulse-dot"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Component to auto-center the map when coordinates change dynamically
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

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
    
    let lastSend = 0;
    
    const sendLocation = async (lat, lng) => {
      if (!lat || !lng) {
        console.warn("Invalid location, skipping update");
        return;
      }
      
      const now = Date.now();
      if (now - lastSend < 5000) return; // Throttle API calls to every 5 seconds
      lastSend = now;

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
          const lat = position?.coords?.latitude;
          const lng = position?.coords?.longitude;
          if (!lat || !lng) return;
          
          setStatus("ACTIVE");
          setCoords({ lat, lng });
          sendLocation(lat, lng);
        },
        error => {
          setStatus("NO SIGNAL");
          console.error("Geolocation error:", error.message);
          return;
        }
      );

      // Watch continuously
      watchId = navigator.geolocation.watchPosition(
        position => {
          const lat = position?.coords?.latitude;
          const lng = position?.coords?.longitude;
          if (!lat || !lng) return;
          
          setStatus("ACTIVE");
          setCoords({ lat, lng });
          sendLocation(lat, lng);
        },
        error => {
          setStatus("NO SIGNAL");
          console.error("Geolocation watch error:", error.message);
          if (watchId !== undefined) {
             navigator.geolocation.clearWatch(watchId);
          }
          return;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
    <div className="terminal-card" style={{ height: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--neon-blue)' }}>
        <MapPin size={16} />
        <span style={{ fontSize: '0.85rem', fontFamily: 'Orbitron' }}>GEO.TRACKER</span>
        <Activity size={14} className="text-blue" style={{ marginLeft: 'auto', opacity: driftDot && status === 'ACTIVE' ? 1 : 0.5, transition: 'opacity 0.3s ease' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="text-dim">LAT:</span> 
          <span style={{ transition: 'color 0.3s ease', color: driftDot && status === 'ACTIVE' ? 'var(--text-primary)' : 'var(--neon-blue)' }}>
            {coords?.lat != null ? Math.abs(coords.lat).toFixed(4) : "--"}° {coords.lat >= 0 ? 'N' : 'S'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace' }}>
          <span className="text-dim">LNG:</span> 
          <span style={{ transition: 'color 0.3s ease', color: !driftDot && status === 'ACTIVE' ? 'var(--text-primary)' : 'var(--neon-blue)' }}>
            {coords?.lng != null ? Math.abs(coords.lng).toFixed(4) : "--"}° {coords.lng >= 0 ? 'E' : 'W'}
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
            }} />
            {status}
          </span>
        </div>
        
        {/* Live Map Render */}
        <div style={{ marginTop: '1.5rem', width: '100%', position: 'relative', zIndex: 1 }}>
          <h4 style={{ 
            color: 'var(--neon-blue)', 
            fontFamily: 'Orbitron', 
            fontSize: '0.85rem', 
            marginBottom: '0.75rem',
            textAlign: 'center',
            textShadow: '0 0 5px var(--neon-blue)'
          }}>📍 LIVE LOCATION</h4>
          <div className="map-container" style={{ 
            height: '200px', 
            width: '100%', 
            borderRadius: '10px', 
            overflow: 'hidden', 
            border: '1px solid var(--neon-blue)',
            boxShadow: '0 0 10px rgba(76, 201, 240, 0.2)'
          }}>
          <MapContainer 
            center={[coords.lat || 12.9716, coords.lng || 77.5946]} 
            zoom={16} 
            style={{ height: '100%', width: '100%' }} 
            zoomControl={false} 
            dragging={false} 
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {status === "ACTIVE" && (
              <Marker position={[coords.lat, coords.lng]} icon={neonIcon}></Marker>
            )}
            <ChangeView center={[coords.lat || 12.9716, coords.lng || 77.5946]} />
          </MapContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
