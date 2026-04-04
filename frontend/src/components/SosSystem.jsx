import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';
import { api } from '../api';

export default function SosSystem({ onTrigger, onError }) {
  const [loading, setLoading] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [ripples, setRipples] = useState([]);
  const audioCtxRef = useRef(null);

  const syncSOSState = async () => {
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
      console.error("Failed to fetch SOS history", err);
    }
  };

  useEffect(() => {
    syncSOSState();
  }, []);

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

    // Add ripple effect
    const newRippleId = Date.now();
    setRipples(prev => [...prev, newRippleId]);
    setTimeout(() => {
      setRipples(prev => prev.filter(id => id !== newRippleId));
    }, 2000);

    try {
      await api.triggerSOS();
      setIsAlert(true);
      playAlertSound();

      // Screen shake effect
      document.body.classList.add('shake-screen');
      setTimeout(() => document.body.classList.remove('shake-screen'), 400);

      if (onTrigger) onTrigger();
      await syncSOSState();
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
        className={`sos-button ${isAlert ? 'active' : 'idle'}`}
        onClick={handleTrigger}
        disabled={loading || isAlert}
      >
        <ShieldAlert size={64} style={{ filter: 'drop-shadow(0 0 10px var(--danger))', transition: 'transform 0.3s ease', transform: loading ? 'scale(0.8)' : 'scale(1)' }} />
        <span>{loading ? 'TRANSMITTING...' : isAlert ? 'SOS ACTIVE' : 'ACTIVATE SOS'}</span>
      </button>

      {isAlert && (
        <button
          onClick={async () => {
            try {
              await api.cancelSOS();
              setIsAlert(false);
              await syncSOSState();
            } catch (err) {
              if (onError) onError(err.message || 'System error: Failed to cancel SOS');
            }
          }}
          className="cyber-button fade-in"
          style={{ fontSize: '0.8rem', padding: '0.5rem', marginTop: '1rem' }}
        >
          <RefreshCcw size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
          CANCEL SOS
        </button>
      )}

    </div>
  );
}
