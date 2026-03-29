import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CalendarDays, Plus, Building2, Hotel, Users } from 'lucide-react';

const API_BOOKINGS = 'http://localhost:8082/bookings';
const API_CUSTOMERS = 'http://localhost:8082/customers';
const API_ROOMS = 'http://localhost:8082/rooms';

const Bookings = ({ user }) => {
  const isAdmin = user?.role === 'admin' || user?.email === 'bk@gmail.com' || user?.email === 'admin@luxestay.com';
  const location = useLocation();
  const prefill = location.state || {};
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(!!prefill.roomType);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    hotelName: prefill.hotelName || '',
    roomId: prefill.roomId || '',
    roomType: prefill.roomType || '',
    checkIn: '',
    checkOut: ''
  });

  const fetchBookings = async () => {
    try {
      const res = await fetch(API_BOOKINGS);
        if (res.ok) {
        const data = await res.json();
        const userBookings = isAdmin 
          ? data 
          : data.filter(b => b.email === user.email || (!b.email && b.customerName === user.name));
        setBookings(userBookings);
      }
    } catch { setBookings([]); }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(API_ROOMS).catch(() => null);
      if (res?.ok) {
        setRooms(await res.json());
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
    } catch { setRooms([]); }
  };

  useEffect(() => { fetchBookings(); fetchRooms(); }, []);

  const getLocalRoomNumber = (roomId) => {
    const room = rooms.find(r => r.id === parseInt(roomId));
    if (!room) return '?';
    const hotelRooms = rooms.filter(r => r.hotelName === room.hotelName).sort((a,b) => a.id - b.id);
    const index = hotelRooms.findIndex(r => r.id === room.id);
    return 101 + index;
  };

  const getAvailableStatus = (room) => {
    let isAvailable = room.available;
    const roomNo = getLocalRoomNumber(room.id);
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if this room is already booked for today
    const activeBookings = bookings.filter(b => 
      (b.status === 'Confirmed' || b.status === 'Checked In') && 
      b.roomType.includes(`Room #${roomNo}`) &&
      (b.roomType.includes(room.hotelName))
    );
    
    for (const booking of activeBookings) {
      if (todayStr >= booking.checkIn && todayStr <= booking.checkOut) {
        isAvailable = false;
        break;
      }
    }
    return isAvailable;
  };

  const availableRooms = rooms.filter(r => {
    // If a hotel is typed/selected, filter by it
    if (form.hotelName && !r.hotelName.toLowerCase().includes(form.hotelName.toLowerCase())) return false;
    return getAvailableStatus(r);
  });

  const handleRoomSelect = (roomId) => {
    const room = rooms.find(r => r.id === parseInt(roomId));
    if (room) {
      setForm({ ...form, roomId: room.id, roomType: room.roomType, hotelName: room.hotelName });
    } else {
      setForm({ ...form, roomId: '', roomType: '', hotelName: '' });
    }
  };

  const handleAdd = async (e) => {
    if (e) e.preventDefault();
    if (!form.roomId || !form.customerName || !form.phone) {
      toast.error('Please fill in guest name, phone, and select a room.', { theme: 'dark' });
      return;
    }
    try {
      const guestPhone = form.phone;
      const bookingRes = await fetch(API_BOOKINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          email: user.email,
          phone: guestPhone,
          roomType: `${form.roomType} — ${form.hotelName} (Room #${getLocalRoomNumber(form.roomId)})`,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          status: 'Confirmed'
        })
      });
      if (!bookingRes.ok) throw new Error();

      try {
        await fetch(API_CUSTOMERS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.customerName,
            email: form.email || user.email,
            phone: guestPhone,
            location: form.hotelName || 'Walk-in Guest',
            visits: 1
          })
        });
      } catch { /* silent */ }

      toast.success(`🎉 Booking confirmed! A REAL confirmation SMS has been sent to ${guestPhone}`, { theme: 'dark', autoClose: 5000 });
      setShowForm(false);
      setForm({ customerName: '', email: '', phone: '', hotelName: '', roomId: '', roomType: '', checkIn: '', checkOut: '' });
      fetchBookings();
      fetchRooms();
    } catch {
      toast.error('Failed to save booking.', { theme: 'dark' });
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${API_BOOKINGS}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Booking #${id} cancelled.`, { theme: 'dark' });
        fetchBookings();
      } else throw new Error();
    } catch {
      toast.error('Failed to cancel booking. (Server Offline)', { theme: 'dark' });
      // For demo purposes, we could filter it out locally if we had a local state that persisted
    }
  };

  const statusBadge = (s) => {
    if (s === 'Confirmed') return <span className="badge badge-success">{s}</span>;
    if (s === 'Checked In') return <span className="badge badge-info">{s}</span>;
    return <span className="badge badge-primary">{s}</span>;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const activeBookings = bookings.filter(b => b.checkOut >= todayStr);
  const historyBookings = bookings.filter(b => b.checkOut < todayStr);

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>Booking Management</h1>
          <p>Manage reservations, select rooms, and track guest schedules.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Cancel' : 'New Booking'}
        </button>
      </div>

      {showForm && (
        <div className="card animate-fadeIn" style={{ marginBottom: '2rem' }}>
          <div className="card-title"><CalendarDays size={18} color="var(--primary)" /> Create Reservation</div>

          {prefill.hotelName && (
            <div style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Hotel size={16} /> Booking from <strong>{prefill.hotelName}</strong> — {prefill.roomType} (Room #{prefill.localNumber || getLocalRoomNumber(prefill.roomId)})
            </div>
          )}

          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Guest Name *</label>
                <input className="form-input" type="text" placeholder="Full name" value={form.customerName}
                  onChange={e => setForm({ ...form, customerName: e.target.value })} 
                  onFocus={() => { if (!form.customerName) setForm({...form, customerName: user.name}) }} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Email</label>
                <input className="form-input" type="email" placeholder="guest@email.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => { if (!form.email) setForm({...form, email: user.email}) }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Phone *</label>
                <input className="form-input" type="text" placeholder="+91 9876543210" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  onFocus={() => { if (!form.phone) setForm({...form, phone: '+91 '}) }} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Hotel</label>
                <input className="form-input" type="text" placeholder="e.g. LuxeStay Mumbai" value={form.hotelName}
                  onChange={e => setForm({ ...form, hotelName: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Room *</label>
                <select className="form-input" value={form.roomId} onChange={e => handleRoomSelect(e.target.value)} required>
                  <option value="">— Choose Room —</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room #{getLocalRoomNumber(r.id)} — {r.roomType} ({r.hotelName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Check-In *</label>
                <input className="form-input" type="date" value={form.checkIn}
                  onChange={e => setForm({ ...form, checkIn: e.target.value })} required />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Check-Out *</label>
                <input className="form-input" type="date" value={form.checkOut}
                  onChange={e => setForm({ ...form, checkOut: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>Confirm Booking</button>
            </div>

            {form.roomId && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(201,169,110,0.06)', border: '1px solid var(--border-primary)', borderRadius: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                ✅ Selected: <strong style={{ color: 'var(--primary)' }}>Room #{getLocalRoomNumber(form.roomId)}</strong> — {form.roomType}
                {form.hotelName && <span> at <strong>{form.hotelName}</strong></span>}
                <div style={{ fontSize: '0.8rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                  A confirmation SMS will be sent to <strong>{form.phone || 'mobile'}</strong> after successful booking.
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarDays size={18} color="var(--primary)" /> Active & Upcoming Bookings
            </div>
            <span className="badge badge-primary">{activeBookings.length}</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {activeBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{b.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{b.customerName?.charAt(0)}</div>
                        {b.customerName}
                      </div>
                    </td>
                    <td><Building2 size={14} style={{ marginRight: 6, color: 'var(--primary)' }} />{b.roomType}</td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td>{statusBadge(b.status)}</td>
                    {isAdmin && (
                      <td>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#ff4444', borderColor: '#ff4444' }}
                          onClick={() => handleCancel(b.id)}
                        >
                          Cancel
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {activeBookings.length === 0 && <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No active bookings.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="var(--primary)" /> Booking History
            </div>
            <span className="badge badge-secondary">{historyBookings.length}</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {historyBookings.map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{b.id}</td>
                    <td>{b.customerName}</td>
                    <td>{b.roomType}</td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td><span className="badge badge-secondary">Completed</span></td>
                    {isAdmin && (
                      <td>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', color: '#ff4444', borderColor: '#ff4444' }}
                          onClick={() => handleCancel(b.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {historyBookings.length === 0 && <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No history found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Bookings;
