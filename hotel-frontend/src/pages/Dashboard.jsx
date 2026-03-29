import React, { useState, useEffect } from 'react';
import { Building2, CalendarDays, IndianRupee, Users, TrendingUp, ArrowUpRight } from 'lucide-react';

const Dashboard = ({ user }) => {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [revenueFilter, setRevenueFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes, customersRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/rooms`).catch(() => null),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/bookings`).catch(() => null),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/customers`).catch(() => null),
        ]);

        if (roomsRes?.ok) {
          setRooms(await roomsRes.json());
        } else {
          // Fallback robust room data: 15 rooms per hotel for total 90 rooms
          const hotelsList = [
            'LuxeStay Chennai', 'LuxeStay Bangalore', 'LuxeStay Kochi',
            'LuxeStay Hyderabad', 'LuxeStay Munnar', 'LuxeStay Ooty'
          ];
          const roomTypes = ['Deluxe', 'Suite', 'Single', 'Double'];
          const fallbackRooms = [];
          let idCounter = 101;
          
          hotelsList.forEach(hotelName => {
            for (let i = 0; i < 15; i++) {
              fallbackRooms.push({
                id: idCounter++,
                hotelName,
                roomType: roomTypes[i % roomTypes.length],
                price: 2500 + (Math.floor(Math.random() * 15) * 500),
                available: true
              });
            }
          });
          setRooms(fallbackRooms);
        }

        if (bookingsRes?.ok) {
          const bData = await bookingsRes.json();
          // Admin sees all; regular users see only their own
          const isAdmin = user?.role === 'admin' || user?.email === 'bk@gmail.com' || user?.email === 'admin@luxestay.com';
          setBookings(isAdmin
            ? bData
            : bData.filter(b => b.email === user?.email || (!b.email && b.customerName === user?.name))
          );
        } else {
          // Fallback empty bookings if server is down (prevents infinite loading)
          setBookings([]);
        }

        if (customersRes?.ok) {
          const cData = await customersRes.json();
          const isAdmin = user?.role === 'admin' || user?.email === 'bk@gmail.com' || user?.email === 'admin@luxestay.com';
          setCustomers(isAdmin
            ? cData
            : cData.filter(c => c.email === user?.email || c.name === user?.name)
          );
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      }
    };
    fetchData();
  }, []);

  const totalBookings = bookings.length;
  const todayCheckins = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.checkIn === today;
  }).length;
  const totalCustomers = customers.length;

  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return bookings.filter(b => {
      const checkOut = new Date(b.checkOut);
      // Ignore unreasonable future dates
      if (isNaN(checkOut.getTime()) || checkOut.getFullYear() > 2100 || checkOut.getFullYear() < 2000) return false;
      
      if (revenueFilter === 'today') {
        return checkOut.toDateString() === today.toDateString();
      }
      if (revenueFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return checkOut.toDateString() === yesterday.toDateString();
      }
      if (revenueFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return checkOut >= weekAgo && checkOut <= now;
      }
      if (revenueFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return checkOut >= monthAgo && checkOut <= now;
      }
      if (revenueFilter === 'year') {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return checkOut >= yearAgo && checkOut <= now;
      }
      return true;
    });
  };

  const filteredBookings = getFilteredBookings();

  const revenue = filteredBookings.reduce((sum, b) => {
    if (b.status !== 'Confirmed' && b.status !== 'Checked In') return sum;
    const roomIdMatch = b.roomType?.match(/Room\s*#(\d+)/i);
    let roomPrice = 0;
    if (roomIdMatch) {
      const roomId = parseInt(roomIdMatch[1]);
      const room = rooms.find(r => r.id === roomId);
      roomPrice = room ? room.price : 8500;
    } else {
      const typeName = b.roomType?.replace(/\s*\(.*\)/, '').trim();
      const room = rooms.find(r => r.roomType === typeName);
      roomPrice = room ? room.price : 8500;
    }
    const checkIn = new Date(b.checkIn);
    const checkOut = new Date(b.checkOut);
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    return sum + (roomPrice * nights);
  }, 0);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Simple way to refresh: re-run the fetchData effect or just reload
        window.location.reload();
      } else throw new Error();
    } catch {
      alert('Failed to delete booking. (Server Offline)');
    }
  };

  const formatRevenue = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val}`;
  };

  const isAdmin = user?.role === 'admin' || user?.email === 'bk@gmail.com' || user?.email === 'admin@luxestay.com';

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p>{isAdmin ? 'Admin overview — all bookings across all hotels.' : "Here's a live overview of your bookings and activity."}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">
            <span>Today's Check-ins</span>
            <CalendarDays size={18} color="var(--primary)" />
          </div>
          <div className="stat-value">{todayCheckins}</div>
          <div className="stat-change">{totalBookings} total bookings</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>Revenue (Bookings)</span>
              <select 
                value={revenueFilter} 
                onChange={(e) => setRevenueFilter(e.target.value)}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.7rem', padding: '2px 4px', borderRadius: 4, cursor: 'pointer' }}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <IndianRupee size={18} color="var(--primary)" />
          </div>
          <div className="stat-value">{formatRevenue(revenue)}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} /> From {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <span>Total {isAdmin ? 'Customers' : 'My Bookings'}</span>
            <Users size={18} color="var(--primary)" />
          </div>
          <div className="stat-value">{isAdmin ? totalCustomers : totalBookings}</div>
          <div className="stat-change positive">
            <ArrowUpRight size={14} /> {isAdmin ? 'Registered guests' : 'Your reservations'}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-title">
          <CalendarDays size={18} color="var(--primary)" /> {isAdmin ? 'All Recent Bookings' : 'Your Recent Bookings'}
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Guest</th><th>Room</th><th>Check In</th><th>Check Out</th><th>Status</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {bookings.slice(-5).reverse().map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{b.customerName?.charAt(0)}</div>
                      {b.customerName}
                    </div>
                  </td>
                  <td><Building2 size={14} style={{ marginRight: 6, color: 'var(--primary)' }} />{b.roomType}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td>
                    {b.status === 'Confirmed' && <span className="badge badge-success">{b.status}</span>}
                    {b.status === 'Checked In' && <span className="badge badge-info">{b.status}</span>}
                    {b.status !== 'Confirmed' && b.status !== 'Checked In' && <span className="badge badge-primary">{b.status}</span>}
                  </td>
                  {isAdmin && (
                    <td>
                      <button 
                        onClick={() => handleCancel(b.id)}
                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.7rem' }}
                      >
                        Cancel
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bookings yet. Create one from the Bookings page!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customers / Profile */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-title"><Users size={18} color="var(--primary)" /> {isAdmin ? 'All Customers' : 'Your Profile Details'}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Hotel / Source</th><th>Visits</th></tr>
            </thead>
            <tbody>
              {customers.slice(-10).reverse().map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{c.name?.charAt(0)}</div>
                      {c.name}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.email}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.phone || '—'}</td>
                  <td>{c.location || '—'}</td>
                  <td><span className="badge badge-primary">{c.visits}</span></td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No customers yet. They'll appear automatically when bookings are made!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
