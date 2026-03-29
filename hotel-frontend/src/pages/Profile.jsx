import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Mail, Phone, Shield, Camera, Save } from 'lucide-react';

const Profile = ({ user, onUpdateUser }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 9876543210',
    role: user?.role || 'Administrator',
  });
  const [editing, setEditing] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser({ ...user, ...form });
    setEditing(false);
    toast.success('Profile updated successfully!', { theme: 'dark' });
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account details and preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem', fontSize: '2.5rem', fontWeight: 700,
            color: '#0a0a0f', fontFamily: 'Playfair Display, serif',
            position: 'relative'
          }}>
            {form.name?.charAt(0)}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--bg-card)', border: '2px solid var(--primary)',
              borderRadius: '50%', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <Camera size={14} color="var(--primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>{form.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{form.email}</p>
          <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
            <Shield size={12} /> {form.role}
          </span>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
              <span>March 2026</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last Login</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1.5rem' }}>
            <User size={18} color="var(--primary)" /> Account Details
            {!editing && (
              <button className="btn btn-outline" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  disabled={!editing} style={{ opacity: editing ? 1 : 0.7 }} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  disabled={!editing} style={{ opacity: editing ? 1 : 0.7 }} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input className="form-input" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  disabled={!editing} style={{ opacity: editing ? 1 : 0.7 }} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input className="form-input" value={form.role} disabled
                  style={{ opacity: 0.7 }} />
              </div>
            </div>

            {editing && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Save Changes</button>
                <button type="button" className="btn btn-outline" onClick={() => { setEditing(false); setForm({ name: user?.name, email: user?.email, phone: user?.phone || '+91 9876543210', role: user?.role || 'Administrator' }); }}>
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default Profile;
