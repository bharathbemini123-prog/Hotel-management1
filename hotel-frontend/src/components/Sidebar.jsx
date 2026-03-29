import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, LayoutDashboard, Hotel, CalendarDays, Users, CreditCard, Coffee, LogOut } from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Building2 size={28} />
        <span>LuxeStay</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/hotels" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Hotel size={18} /> Our Hotels
        </NavLink>

        <NavLink to="/bookings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarDays size={18} /> Bookings
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={18} /> Customers
        </NavLink>
        <NavLink to="/checkout" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={18} /> Checkout
        </NavLink>
        <NavLink to="/food-order" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Coffee size={18} /> Food Order
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', borderRadius: '10px', transition: 'background 0.2s' }} className="profile-link">
          <div className="avatar">{user?.name?.charAt(0)}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</div>
          </div>
        </NavLink>
        <button onClick={onLogout} className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
