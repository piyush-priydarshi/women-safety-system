import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import { api } from '../api';

export default function ContactsPanel({ onContactAdded, onContactRemoved }) {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await api.getContacts();
      setContacts(Array.isArray(res) ? res : res.contacts || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load contacts');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    setLoading(true);
    setError('');
    
    // Optimistic UI directly adding the node (makes it instant)
    const tempContact = { id: Date.now(), ...newContact, isTemp: true };
    setContacts(prev => [...prev, tempContact]);

    try {
      const res = await api.addContact(newContact);
      if (onContactAdded) onContactAdded(newContact.name);
      setNewContact({ name: '', phone: '' });
      // Fetch fresh so we get DB IDs
      await fetchContacts();
    } catch (err) {
      setError(err.message || 'Failed to add contact');
      // Rollback optimistic
      setContacts(prev => prev.filter(c => c.id !== tempContact.id));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id, name) => {
    // Optimistic removal
    const oldContacts = [...contacts];
    setContacts(prev => prev.filter(c => c.id !== id));
    
    try {
      await api.removeContact(id);
      if (onContactRemoved) onContactRemoved(name);
    } catch (err) {
      setError(err.message || 'Failed to remove contact');
      // Rollback optimistic
      setContacts(oldContacts);
    }
  };

  return (
    <div className="terminal-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--neon-blue)', paddingBottom: '0.5rem' }}>
        <Users size={18} className="text-blue" />
        <h3 style={{ margin: 0, color: 'var(--neon-blue)', fontSize: '1rem' }}>
          CONTACT_NODES
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto', marginBottom: '1rem', maxHeight: '200px' }} className="fade-in">
        {contacts.length === 0 ? (
          <div className="text-dim fade-in" style={{ fontSize: '0.85rem' }}>[NO_CONTACTS_FOUND]</div>
        ) : (
          contacts.map((c) => (
            <div key={c.id} className="contact-card fade-in" style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem 0.75rem',
              background: 'rgba(76, 201, 240, 0.05)',
              borderLeft: '2px solid var(--neon-blue)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              opacity: c.isTemp ? 0.5 : 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 5px #00ff88' }} title="Connected" />
                <span style={{ fontWeight: 'bold' }}>{c.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="text-dim" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.phone}</span>
                <button 
                  onClick={() => handleRemove(c.id, c.name)}
                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7, padding: '2px' }}
                  title="Remove Node"
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {error && <div className="fade-in" style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,0,60,0.1)', border: '1px solid var(--danger)' }}>&gt; ERR: {error}</div>}

      <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            className="cyber-input" 
            style={{ flex: 1, fontSize: '0.85rem' }} 
            placeholder="NODE_NAME" 
            value={newContact.name}
            onChange={e => setNewContact({...newContact, name: e.target.value})}
          />
          <input 
            className="cyber-input" 
            style={{ flex: 1, fontSize: '0.85rem' }} 
            placeholder="NODE_COM" 
            value={newContact.phone}
            onChange={e => setNewContact({...newContact, phone: e.target.value})}
          />
        </div>
        <button type="submit" className="cyber-button" disabled={loading} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <UserPlus size={14} /> {loading ? 'ADDING...' : 'ADD_NODE'}
        </button>
      </form>
    </div>
  );
}
