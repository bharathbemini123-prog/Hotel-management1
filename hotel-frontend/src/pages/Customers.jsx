import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Users, Mail, Phone, MapPin } from 'lucide-react';

const API = `${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/customers`;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', visits: 1 });

  const fetchCustomers = async () => {
    try {
      const res = await fetch(API);
      if (res.ok) {
        setCustomers(await res.json());
      } else throw new Error();
    } catch {
      setCustomers([
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', location: 'Mumbai, India', visits: 3 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1 2345678900', location: 'London, UK', visits: 1 },
        { id: 3, name: 'Rahul Sharma', email: 'rahul@test.com', phone: '+91 9988776655', location: 'Delhi, India', visits: 5 },
      ]);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, visits: parseInt(form.visits) })
      });
      if (res.ok) {
        toast.success('Customer added!', { theme: 'dark' });
        setShowForm(false);
        setForm({ name: '', email: '', phone: '', location: '', visits: 1 });
        fetchCustomers();
      } else throw new Error();
    } catch { toast.error('Failed to add customer.', { theme: 'dark' }); }
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <p>View and manage your guest directory.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          + {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label"><span>Total Customers</span><Users size={18} color="var(--primary)" /></div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><span>Active Guests</span></div>
          <div className="stat-value">18</div>
        </div>
        <div className="stat-card">
          <div className="stat-label"><span>Repeat Guests</span></div>
          <div className="stat-value">42%</div>
        </div>
      </div>

      {showForm && (
        <div className="card animate-fadeIn" style={{ marginBottom: '2rem' }}>
          <div className="card-title"><Users size={18} color="var(--primary)" /> Add Customer</div>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Full Name</label>
              <input className="form-input" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Phone</label>
              <input className="form-input" type="text" placeholder="+91 9876543210" value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
                onFocus={() => { if (!form.phone) setForm({...form, phone: '+91 '}) }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Location</label>
              <input className="form-input" type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Total Visits</label>
              <input className="form-input" type="number" value={form.visits} onChange={e => setForm({...form, visits: e.target.value})} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-full">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-title"><Users size={18} color="var(--primary)" /> Guest Directory</div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Guest</th><th>Contact</th><th>Location</th><th>Visits</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar">{c.name?.charAt(0)}</div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}><Mail size={12} /> {c.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {c.phone}</div>
                    </div>
                  </td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} color="var(--text-muted)" /> {c.location}</div></td>
                  <td><span className="badge badge-primary">{c.visits} visit{c.visits !== 1 ? 's' : ''}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Customers;
