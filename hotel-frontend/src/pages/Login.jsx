import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Building2 } from 'lucide-react';

const defaultUsers = [
  { name: 'Admin', email: 'admin@luxestay.com', password: 'admin123', role: 'admin' }
];

const getStoredUsers = () => {
  try {
    const stored = localStorage.getItem('luxestay_users');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure the default admin user is always present
      const hasAdmin = parsed.some(u => u.email === 'admin@luxestay.com');
      if (!hasAdmin) return [...defaultUsers, ...parsed];
      return parsed;
    }
  } catch (e) { /* ignore parse errors */ }
  return defaultUsers;
};

const Login = ({ onLogin }) => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [users, setUsers] = useState(getStoredUsers);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = form.email.toLowerCase().trim();
    if (tab === 'register') {
      if (!form.name || !email || !form.password) {
        toast.error('Please fill all fields.');
        return;
      }
      const exists = users.find(u => u.email === email);
      if (exists) {
        toast.error('An account with this email already exists.', { theme: 'dark' });
        return;
      }
      const newUsers = [...users, { name: form.name, email, password: form.password }];
      setUsers(newUsers);
      localStorage.setItem('luxestay_users', JSON.stringify(newUsers));
      toast.success('Account created! Please login now.', { theme: 'dark' });
      setTab('login');
      setForm({ name: '', email: '', password: '' });
    } else {
      const found = users.find(u => u.email === email && u.password === form.password);
      if (found) {
        toast.success(`Welcome back, ${found.name}!`, { theme: 'dark' });
        onLogin(found);
      } else {
        toast.error('Invalid email or password.', { theme: 'dark' });
      }
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <Building2 size={36} color="#2563eb" />
        </div>
        <h1>LuxeStay</h1>
        <p className="subtitle">Premium Hotel Management System</p>

        <div className="login-tabs">
          <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => handleTabChange('login')}>
            Sign In
          </button>
          <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => handleTabChange('register')}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" type="text" placeholder="Your full name"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '0.5rem', padding: '1rem' }}>
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Demo: admin@luxestay.com / admin123
        </p>
      </div>
    </div>
  );
};

export default Login;
