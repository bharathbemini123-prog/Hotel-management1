import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Star, MapPin, X, Building2, CheckCircle, XCircle, CalendarDays, Wifi, Coffee, Car, Dumbbell, AlertTriangle, Plus } from 'lucide-react';

const API_ROOMS = 'http://localhost:8082/rooms';
const API_BOOKINGS = 'http://localhost:8082/bookings';

const hotels = [
  {
    id: 1, name: 'LuxeStay Chennai', location: 'Chennai, Tamil Nadu', rating: 4.9, reviews: 312,
    price: '₹8,500', currency: '₹', image: '/images/hotel_mumbai.png', tag: 'Most Popular',
    desc: 'Stunning beachfront property overlooking the Bay of Bengal with panoramic sea views.',
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Valet Parking'],
  },
  {
    id: 2, name: 'LuxeStay Bangalore', location: 'Bangalore, Karnataka', rating: 4.8, reviews: 256,
    price: '₹7,450', currency: '₹', image: '/images/hotel_london.png', tag: 'Business Premium',
    desc: 'A modern luxury property in the heart of the IT corridor with lush green surroundings.',
    amenities: ['Free WiFi', 'Concierge', 'Restaurant', 'Bar', 'Gym'],
  },
  {
    id: 3, name: 'LuxeStay Kochi', location: 'Kochi, Kerala', rating: 5.0, reviews: 189,
    price: '₹12,200', currency: '₹', image: '/images/hotel_maldives.png', tag: 'Top Rated',
    desc: 'Exclusive backwater resort with private houseboats and traditional Kerala architecture.',
    amenities: ['Free WiFi', 'Private Pool', 'Ayurveda Spa', 'Backwater Cruise', 'Butler Service'],
  },
  {
    id: 4, name: 'LuxeStay Hyderabad', location: 'Hyderabad, Telangana', rating: 4.7, reviews: 198,
    price: '₹6,800', currency: '₹', image: '/images/hotel_paris.png', tag: 'Heritage Royalty',
    desc: 'A royal palace-style boutique hotel inspired by the Nizams of Hyderabad.',
    amenities: ['Free WiFi', 'Rooftop Bar', 'Fine Dining', 'Concierge', 'Spa'],
  },
  {
    id: 5, name: 'LuxeStay Munnar', location: 'Munnar, Kerala', rating: 4.9, reviews: 421,
    price: '₹9,100', currency: '₹', image: '/images/hotel_dubai.png', tag: 'Nature Retreat',
    desc: 'Serene mountain resort nestled among sprawling tea gardens and misty peaks.',
    amenities: ['Free WiFi', 'Infinity Pool', 'Tea Tasting', 'Trekking', 'Bonfire'],
  },
  {
    id: 6, name: 'LuxeStay Ooty', location: 'Ooty, Tamil Nadu', rating: 4.8, reviews: 175,
    price: '₹8,200', currency: '₹', image: '/images/hotel_bali.png', tag: 'Hill Station',
    desc: 'Classic British-era colonial bungalow resort amid lush pine forests and gardens.',
    amenities: ['Free WiFi', 'Heated Pool', 'Library', 'Spa', 'Organic Dining'],
  },
];

const sortedHotels = [...hotels].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

const amenityIcon = (a) => {
  if (a.includes('WiFi')) return <Wifi size={14} />;
  if (a.includes('Gym') || a.includes('Yoga')) return <Dumbbell size={14} />;
  if (a.includes('Coffee') || a.includes('Dining') || a.includes('Restaurant')) return <Coffee size={14} />;
  if (a.includes('Parking') || a.includes('Valet') || a.includes('Helipad')) return <Car size={14} />;
  return <CheckCircle size={14} />;
};

const Hotels = ({ user }) => {
  const isAdmin = user?.role === 'admin' || user?.email === 'bk@gmail.com' || user?.email === 'admin@luxestay.com';
  const [selected, setSelected] = useState(null);
  const [dbRooms, setDbRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hotelName: '', roomType: 'Deluxe', price: 2500, available: true });
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch(API_ROOMS).catch(() => null),
          fetch(API_BOOKINGS).catch(() => null)
        ]);
        if (roomsRes?.ok) {
          const fetchedRooms = await roomsRes.json();
          if (fetchedRooms.length > 0) {
            // Auto-assign orphan legacy database rooms to South Indian hotels
            const mappedRooms = fetchedRooms.map((r, index) => {
              if (!r.hotelName || r.hotelName === '—') {
                const defaults = [
                  'LuxeStay Chennai', 'LuxeStay Bangalore', 'LuxeStay Kochi',
                  'LuxeStay Hyderabad', 'LuxeStay Munnar', 'LuxeStay Ooty'
                ];
                return { ...r, hotelName: defaults[index % defaults.length] };
              }
              return r;
            });
            setDbRooms(mappedRooms);
          } else {
            throw new Error('Empty');
          }
        } else {
          throw new Error('Failed');
        }
        if (bookingsRes?.ok) setBookings(await bookingsRes.json());
      } catch { 
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
              available: true // All rooms available by default, checked dynamically
            });
          }
        });
        setDbRooms(fallbackRooms);
      }
    };
    fetchData();
  }, []);

  const getRoomStatus = (room) => {
    let isAvailable = room.available;
    let bookedUntil = null;
    
    // Determine the dynamic local room number securely here
    const hotelRooms = [...dbRooms].filter(r => r.hotelName === room.hotelName).sort((a,b) => a.id - b.id);
    const index = hotelRooms.findIndex(r => r.id === room.id);
    const localRoomNumber = 101 + index;

    const date = new Date();
    const todayStr = date.toISOString().split('T')[0];

    const activeBookings = bookings.filter(b => 
      (b.status === 'Confirmed' || b.status === 'Checked In') && 
      b.roomType.includes(`Room #${localRoomNumber}`) &&
      (b.roomType.includes(room.hotelName))
    );
    
    for (const booking of activeBookings) {
      // If today is within [checkIn, checkOut], mark as booked
      if (todayStr >= booking.checkIn && todayStr <= booking.checkOut) {
        isAvailable = false;
        bookedUntil = booking.checkOut;
        break;
      }
    }

    return { isAvailable, bookedUntil, localRoomNumber };
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const newRoomLocal = {
      ...form,
      id: Date.now(), // Temporary ID for offline/immediate UI update
      price: parseFloat(form.price)
    };

    try {
      const res = await fetch(API_ROOMS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoomLocal)
      });
      if (res.ok) {
        toast.success('Room added successfully!', { theme: 'dark' });
        setShowForm(false);
        setForm({ hotelName: '', roomType: 'Deluxe', price: 2500, available: true });
        // Refresh rooms quietly
        const roomsRes = await fetch(API_ROOMS).catch(() => null);
        if (roomsRes?.ok) setDbRooms(await roomsRes.json());
      } else throw new Error();
    } catch { 
      // OFFLINE SUPPORT: Update local state even if server fails
      toast.warning('Server offline. Room added to local session.', { theme: 'dark' });
      setDbRooms(prev => [...prev, newRoomLocal]);
      setShowForm(false);
      setForm({ hotelName: '', roomType: 'Deluxe', price: 2500, available: true });
    }
  };

  const handleBook = (hotel, room, localNumber) => {
    setSelected(null);
    navigate('/bookings', {
      state: {
        hotelName: hotel.name,
        roomType: room.roomType || room.type,
        roomId: room.id,
        localNumber
      }
    });
  };

  const getStartingPrice = (hotelName) => {
    const hotelRooms = dbRooms.filter(r => r.hotelName === hotelName);
    if (hotelRooms.length === 0) return 2500;
    return Math.min(...hotelRooms.map(r => r.price || 8500));
  };

  const formatPrice = (hotel, price) => {
    return `${hotel.currency || '₹'}${price.toLocaleString()}`;
  };

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>Our Hotels</h1>
          <p>Discover our premium properties — sorted by highest rating. Click a hotel to view rooms.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> {showForm ? 'Cancel' : 'Add Room'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card animate-fadeIn" style={{ marginBottom: '2rem' }}>
          <div className="card-title"><Plus size={18} color="var(--primary)" /> Add New Room</div>
          <form onSubmit={handleAddRoom} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Hotel</label>
              <select className="form-input" value={form.hotelName} onChange={e => setForm({...form, hotelName: e.target.value})} required>
                <option value="">-- Select Hotel --</option>
                {hotels.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Room Type</label>
              <select className="form-input" value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})}>
                <option>Single</option><option>Double</option><option>Deluxe</option><option>Suite</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Price (₹ / night)</label>
              <input className="form-input" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Status</label>
              <select className="form-input" value={form.available} onChange={e => setForm({...form, available: e.target.value === 'true'})}>
                <option value="true">Available</option>
                <option value="false">Booked</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Save Room</button>
          </form>
        </div>
      )}

      <div className="hotels-grid">
        {sortedHotels.map((hotel, i) => (
          <div key={hotel.id} className={`hotel-card animate-fadeIn animate-fadeIn-${i + 1}`}
            onClick={() => setSelected(hotel)} style={{ cursor: 'pointer' }}>
            <div style={{ overflow: 'hidden', position: 'relative' }}>
              <img src={hotel.image} alt={hotel.name} />
              {hotel.tag && (
                <span style={{
                  position: 'absolute', top: '12px', left: '12px',
                  background: 'rgba(201,169,110,0.9)', color: '#0a0a0f',
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600
                }}>{hotel.tag}</span>
              )}
            </div>
            <div className="hotel-card-body">
              <h3>{hotel.name}</h3>
              <div className="location"><MapPin size={14} /> {hotel.location}</div>
              <div className="hotel-card-footer">
                <div className="hotel-rating">
                  <Star size={16} fill="#2563eb" /> {hotel.rating}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem', marginLeft: 4 }}>
                    ({hotel.reviews})
                  </span>
                </div>
              </div>
              {/* Show DB room count and Dynamic Starting Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  🏨 {dbRooms.filter(r => r.hotelName === hotel.name && (r.available !== false)).length} rooms available
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Starting from</div>
                  <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem' }}>₹{getStartingPrice(hotel.name).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button className="btn btn-primary" style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}>
                  View All Rooms →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '24px', maxWidth: '1000px', width: '100%',
            maxHeight: '92vh', overflowY: 'auto', animation: 'fadeInUp 0.3s ease-out',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Gallery Section */}
            <div className="hotel-gallery" style={{ borderBottom: '1px solid var(--border)', marginBottom: 0, borderRadius: '24px 24px 0 0', position: 'relative' }}>
              <img src="/images/room_1.png" className="gallery-main" alt="Main" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <img src="/images/room_2.png" className="gallery-sub" alt="Sub 1" />
                <img src="/images/room_3.png" className="gallery-sub" alt="Sub 2" />
              </div>
              <button onClick={() => setSelected(null)} style={{
                position: 'absolute', top: 20, right: 20,
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
              }}><X size={20} /></button>
            </div>

            {/* Header / Sub-Nav */}
            <div style={{ padding: '2rem 2.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{selected.name} <span style={{ fontSize: '1rem', color: '#ffca28' }}>★★★</span></h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2563eb', padding: '4px 10px', borderRadius: 6, color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                      {selected.rating}
                    </div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Excellent · {selected.reviews} Ratings</span>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={16} color="var(--primary)" />
                      {selected.location}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline" style={{ borderRadius: 20, padding: '0.5rem 1.25rem' }}>Save <Star size={14} /></button>
                  <button className="btn btn-outline" style={{ borderRadius: 20, padding: '0.5rem 1.25rem' }}>Share</button>
                </div>
              </div>

              {/* Tabs */}
              <div className="tab-nav">
                {['Overview', 'Rooms', 'Reviews'].map(t => (
                  <button 
                    key={t} 
                    className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                    onClick={() => setActiveTab(t)}
                  >{t}</button>
                ))}
              </div>

              {/* Layout: Content | Sidebar */}
              <div className="detail-layout" style={{ position: 'relative', paddingBottom: '2.5rem' }}>
                {/* Main Section */}
                <div className="detail-main">
                  {activeTab === 'Overview' && (
                    <div className="animate-fadeIn">
                      <div className="feature-badges">
                        <div className="feature-item">
                          <div className="feature-icon"><Coffee size={18} /></div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Friendly Staff</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Staff are generally friendly and helpful.</div>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon"><Building2 size={18} /></div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Comfortable Stay</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rooms are spacious and well-decorated.</div>
                          </div>
                        </div>
                      </div>

                      <h3 style={{ marginBottom: '1rem' }}>About this property</h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '2rem' }}>
                        {selected.desc} Experience the height of luxury at {selected.name}, where modern elegance meets traditional charm. 
                        Our property offers a unique blend of heritage and comfort, ensuring an unforgettable stay for every guest.
                      </p>

                      <h3 style={{ marginBottom: '1.25rem' }}>Available Amenities</h3>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                        {selected.amenities.map(a => (
                          <span key={a} className="badge badge-primary" style={{ padding: '8px 16px', borderRadius: 12, gap: 8, fontSize: '0.9rem' }}>
                            {amenityIcon(a)} {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'Rooms' && (
                    <div className="animate-fadeIn">
                      <h3 style={{ marginBottom: '1.5rem' }}>Experience the best stay</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {dbRooms.filter(r => r.hotelName === selected.name).map((room, index) => {
                          const localRoomNumber = 101 + index;
                          const { isAvailable, bookedUntil } = getRoomStatus(room);
                          return (
                            <div key={room.id} style={{
                              display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                              borderRadius: 20, overflow: 'hidden', transition: 'var(--transition)'
                            }}>
                              <div style={{ width: '240px', position: 'relative' }}>
                                <img src={`/images/room_${(index % 3) + 1}.png`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {!isAvailable && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="badge badge-warning">Booked until {bookedUntil}</span></div>}
                              </div>
                              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                  <h4 style={{ fontSize: '1.2rem' }}>{room.roomType} Room</h4>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Room #{localRoomNumber}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Wifi size={14} /> Free WiFi</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Coffee size={14} /> Breakfast Incl.</span>
                                </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 2 }}>{formatPrice(selected, room.price || 8500)}</div>
                                      <span style={{ color: isAvailable ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {isAvailable ? '● Available Now' : '○ Not Available'}
                                      </span>
                                    </div>
                                    <button 
                                      className={`btn ${isAvailable ? 'btn-vibrant' : 'btn-outline'}`}
                                      disabled={!isAvailable}
                                      onClick={() => handleBook(selected, room, localRoomNumber)}
                                      style={{ minWidth: '140px' }}
                                    >
                                      {isAvailable ? 'Book This Room' : 'Fully Booked'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                  )}

                  {activeTab === 'Reviews' && (
                    <div className="animate-fadeIn">
                      <div className="card" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '3rem', fontWeight: 800 }}>{selected.rating}</div>
                            <div style={{ fontWeight: 700 }}>Excellent reputation</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Based on {selected.reviews} public verified reviews</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="badge badge-success" style={{ fontSize: '1rem', padding: '10px 20px' }}>92% Recommended</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                          { name: 'Arun Kumar', date: 'March 15, 2026', rating: 5, comment: 'Absolutely stunning property. The staff was incredibly helpful and the view from the room was breathtaking. Highly recommended!' },
                          { name: 'Sanjana Rao', date: 'March 10, 2026', rating: 4, comment: 'Great location and very comfortable rooms. The breakfast spread was amazing. Will definitely visit again.' },
                          { name: 'Vikram Singh', date: 'February 28, 2026', rating: 5, comment: 'The best luxury experience in the city. The spa services were world-class.' }
                        ].map((rev, idx) => (
                          <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div className="avatar" style={{ width: 32, height: 32 }}>{rev.name[0]}</div>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rev.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.date}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffca28' }}>
                                {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="#ffca28" />)}
                              </div>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar Section */}
                <div className="detail-sidebar">
                  <div className="booking-sidebar-card">
                    <div style={{ display: 'flex', gap: 12, marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                      <div style={{ width: 80, height: 60, borderRadius: 8, overflow: 'hidden' }}>
                        <img src="/images/room_1.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <span className="badge badge-info" style={{ fontSize: '0.6rem', marginBottom: 4 }}>Recommended Deal</span>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Standard Deluxe</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: '0.85rem' }}>
                        <CheckCircle size={14} /> Free Cancellation
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <CheckCircle size={14} /> Free Parking
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <CalendarDays size={14} /> Pay at Hotel Available
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>Starting from</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{getStartingPrice(selected.name).toLocaleString()}</span>
                          <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '0.9rem' }}>₹{(getStartingPrice(selected.name) * 1.5).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+ taxes & fees, per night for 1 room</p>
                    </div>

                    <button className="btn btn-vibrant btn-full" style={{ marginBottom: 12, padding: '1rem' }}
                      onClick={() => setActiveTab('Rooms')}>
                      Book 1 Room
                    </button>
                    <button className="btn btn-outline btn-full" style={{ padding: '0.85rem' }}
                      onClick={() => setActiveTab('Rooms')}>
                      View All Rooms
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Hotels;
