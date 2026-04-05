import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Terminal, Lock, User, Phone, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await api.login({ phone: formData.phone, password: formData.password });
      } else {
        res = await api.register({
          name: formData.name,
          phone: formData.phone,
          password: formData.password
        });
      }

      // Store token and user data locally
      localStorage.clear();
      localStorage.setItem('token', res.token);
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      } else {
        // Fallback if backend does not return user object but only token
        localStorage.setItem('user', JSON.stringify({ name: formData.name || 'User', phone: formData.phone }));
      }

      console.log(`[AUTH] ${isLogin ? 'Login' : 'Register'} successful.`);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
      console.error('[AUTH ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
      <div className="terminal-card terminal-card-pink" style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={40} className="text-pink" />
          <h2 style={{ margin: 0 }} className="text-pink">SYSTEM ACCESS</h2>
          <p className="text-dim" style={{ fontSize: '0.85rem' }}>
            {isLogin ? 'Enter your credentials to continue' : 'Register your identity in the grid'}
          </p>
        </div>

        {error && (
          <div className="terminal-card-danger fade-in" style={{ padding: '0.75rem', fontSize: '0.9rem', color: 'var(--danger)', border: '1px solid var(--danger)', background: 'rgba(255,0,60,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>&gt; SYS_ERR:</span> {error.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {!isLogin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <User className="text-dim" size={20} />
              <input
                type="text"
                name="name"
                placeholder="USERNAME"
                className="cyber-input"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Phone className="text-dim" size={20} />
            <input
              type="text"
              name="phone"
              placeholder="PHONE NUMBER"
              className="cyber-input"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock className="text-dim" size={20} />
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              className="cyber-input"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button
            type="submit"
            className="cyber-button pink"
            disabled={loading}
            style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            {loading ? 'PROCESSING...' : (isLogin ? <><LogIn size={18} /> INITIATE LOGIN</> : <><UserPlus size={18} /> COMPILE IDENTITY</>)}
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--neon-purple)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}
          >
            {isLogin ? '> INITIATE NEW REGISTRATION SEQUENCE' : '> RETURN TO LOGIN PORTAL'}
          </button>
        </div>

      </div>
    </div>
  );
}
