import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import { api } from '../api';

export default function SosSystem({ onTrigger, onCancel, onLog, onError }) {
  const [loading, setLoading] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [ripples, setRipples] = useState([]);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const checkState = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAlert(false);
        setIsChecking(false);
        return;
      }
      try {
        const response = await api.getSOSHistory();
        if (response.history && response.history.length > 0) {
          const lastEntry = response.history[response.history.length - 1];
          const firstEntry = response.history[0];
          if (lastEntry.status === 'active' || firstEntry.status === 'active') {
            setIsAlert(true);
          } else {
            setIsAlert(false);
          }
        } else {
          setIsAlert(false);
        }
      } catch (err) {
        console.error("Failed to check SOS state", err);
        setIsAlert(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkState();
  }, []);

  useEffect(() => {
    const favicon = document.getElementById("favicon");
    const faviconApple = document.getElementById("favicon-apple");
    if (favicon) {
      favicon.href = isAlert ? "/favicon-alert.png" : "/favicon-normal.png";
    }
    if (faviconApple) {
      faviconApple.href = isAlert ? "/favicon-alert.png" : "/favicon-normal.png";
    }
  }, [isAlert]);

  // Play a retro alert beep using Web Audio API
  const playAlertSound = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    // Create an oscillator
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3); // Drop to A4

    // Volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  };

  const handleTrigger = async () => {
    if (loading || isAlert) return;
    setLoading(true);

    try {
      const response = await api.getSOSHistory();
      if (response.history && response.history.length > 0) {
        const lastEntry = response.history[response.history.length - 1];
        const firstEntry = response.history[0];
        if (lastEntry.status === 'active' || firstEntry.status === 'active') {
          if (onError) onError('⚠ SOS already active. Cancel first.');
          setIsAlert(true);
          setLoading(false);
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // Add ripple effect
      const newRippleId = Date.now();
      setRipples(prev => [...prev, newRippleId]);
      setTimeout(() => {
        setRipples(prev => prev.filter(id => id !== newRippleId));
      }, 2000);

      await api.triggerSOS();
      setIsAlert(true);
      playAlertSound();

      // Screen shake effect
      document.body.classList.add('shake-screen');
      setTimeout(() => document.body.classList.remove('shake-screen'), 400);

      if (onTrigger) onTrigger();

      // Simulate alerts sequence
      const dbContacts = await api.getContacts();
      const contactList = Array.isArray(dbContacts) ? dbContacts : dbContacts.contacts || [];
      
      if (contactList.length === 0) {
        if (onLog) onLog("[NO_CONTACTS_FOUND]", "danger");
      }

      let baseTime = 500;
      setTimeout(() => { if (onLog) onLog("📍 Location shared", "success"); }, baseTime);
      
      baseTime += 500;
      setTimeout(() => { if (onLog) onLog("📩 Alert sent to contacts", "success"); }, baseTime);
      
      contactList.forEach((c) => {
        baseTime += 500;
        setTimeout(() => {
          if (onLog) onLog(`📩 Alert sent to ${c.name ? c.name.toUpperCase() : 'UNKNOWN'}`, "success");
        }, baseTime);
      });
      
      baseTime += 500;
      setTimeout(() => { if (onLog) onLog("🚓 Authorities notified", "danger"); }, baseTime);
      
      baseTime += 500;
      setTimeout(() => { if (onLog) onLog("⚠ Emergency mode active", "danger"); }, baseTime);

    } catch (err) {
      if (onError) onError(err.message || 'System error: Failed to trigger SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

      {/* Decorative Outer Rings */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        border: '1px dashed var(--neon-purple)',
        opacity: 0.5,
        animation: 'spin 20s linear infinite',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        border: `1px solid ${isAlert ? 'var(--danger)' : 'var(--neon-blue)'}`,
        opacity: 0.3,
        pointerEvents: 'none'
      }} />

      {/* Ripple Layers */}
      {ripples.map(id => (
        <div key={id} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          border: '2px solid var(--danger)',
          boxShadow: '0 0 20px var(--danger)',
          pointerEvents: 'none',
          animation: 'rippleWave 1.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards'
        }} />
      ))}

      <button
        className={`sos-button ${isChecking ? 'idle' : isAlert ? 'active' : 'idle'}`}
        onClick={handleTrigger}
        disabled={loading || isAlert || isChecking}
      >
        <ShieldAlert size={64} style={{ filter: 'drop-shadow(0 0 10px var(--danger))', transition: 'transform 0.3s ease', transform: loading || isChecking ? 'scale(0.8)' : 'scale(1)' }} />
        <span>{isChecking ? 'SYNCING...' : loading ? 'TRANSMITTING...' : isAlert ? 'SOS ACTIVE' : 'ACTIVATE SOS'}</span>
      </button>

      {isAlert && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
          <h3 className="fade-in" style={{
            color: 'var(--danger)',
            fontFamily: 'Orbitron',
            textShadow: '0 0 10px var(--danger)',
            marginBottom: '0.5rem',
            animation: 'alertPulse 2s infinite'
          }}>
            ⚠ EMERGENCY MODE ACTIVE
          </h3>
          <button
            onClick={async () => {
              if (cancelLoading) return;
            setCancelLoading(true);
            try {
              await api.cancelSOS();
              setIsAlert(false);
              if (onCancel) onCancel();
              if (onLog) onLog("✅ SOS cancelled successfully", "success");
            } catch (err) {
              if (onError) onError(err.message || 'System error: Failed to cancel SOS');
            } finally {
              setCancelLoading(false);
            }
          }}
          disabled={cancelLoading}
          className="cyber-button fade-in"
          style={{ fontSize: '0.8rem', padding: '0.5rem', marginTop: '1rem', cursor: cancelLoading ? 'wait' : 'pointer' }}
          >
            <RefreshCcw size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
            {cancelLoading ? 'CANCELLING...' : 'CANCEL SOS'}
          </button>
        </div>
      )}

    </div>
  );
}
