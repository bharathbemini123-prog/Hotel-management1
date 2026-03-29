import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Coffee, Plus, Minus, ShoppingCart, Utensils, ClipboardList, Clock, CheckCircle2 } from 'lucide-react';

const MENU = [
  { id: 1, name: 'Continental Breakfast', price: 450, category: 'Breakfast' },
  { id: 2, name: 'Masala Dosa', price: 150, category: 'Breakfast' },
  { id: 3, name: 'Idli Sambar', price: 120, category: 'Breakfast' },
  { id: 4, name: 'Chicken Biryani', price: 380, category: 'Main Course' },
  { id: 5, name: 'Paneer Butter Masala', price: 320, category: 'Main Course' },
  { id: 6, name: 'Grilled Fish', price: 450, category: 'Main Course' },
  { id: 7, name: 'Caesar Salad', price: 220, category: 'Starters' },
  { id: 8, name: 'Veg Spring Rolls', price: 180, category: 'Starters' },
  { id: 9, name: 'Chocolate Lava Cake', price: 280, category: 'Desserts' },
  { id: 10, name: 'Fresh Lime Soda', price: 80, category: 'Beverages' },
  { id: 11, name: 'Cold Coffee', price: 120, category: 'Beverages' },
  { id: 12, name: 'Mango Lassi', price: 110, category: 'Beverages' },
];

const categories = [...new Set(MENU.map(i => i.category))];

const HOTELS = [
  'LuxeStay Chennai',
  'LuxeStay Bangalore',
  'LuxeStay Kochi',
  'LuxeStay Hyderabad',
  'LuxeStay Munnar',
  'LuxeStay Ooty',
];

const FoodOrder = () => {
  const [cart, setCart] = useState([]);
  const [hotel, setHotel] = useState('');
  const [room, setRoom] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [orders, setOrders] = useState([]);

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === id);
      if (ex.qty === 1) return prev.filter(c => c.id !== id);
      return prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const cartQty = (id) => cart.find(c => c.id === id)?.qty || 0;
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const placeOrder = () => {
    if (!hotel) { toast.error('Please select a hotel.', { theme: 'dark' }); return; }
    if (!room) { toast.error('Please enter a room number.', { theme: 'dark' }); return; }
    if (cart.length === 0) { toast.error('Cart is empty.', { theme: 'dark' }); return; }

    const newOrder = {
      id: Date.now(),
      hotel,
      room,
      items: [...cart],
      total,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Preparing'
    };

    setOrders(prev => [newOrder, ...prev]);
    toast.success(`🍽️ Order of ₹${total.toLocaleString()} placed for ${hotel} — Room ${room}!`, { theme: 'dark' });
    setCart([]);
    setHotel('');
    setRoom('');

    // Simulate delivery after 10 seconds
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'Delivered' } : o));
    }, 10000);
  };

  const filtered = activeCategory === 'All' ? MENU : MENU.filter(i => i.category === activeCategory);

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>Restaurant & Room Service</h1>
          <p>Order food directly to guest rooms across all LuxeStay hotels.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* MENU */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {['All', ...categories].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`btn ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                {cat}
              </button>
            ))}
          </div>

          <div className="menu-grid">
            {filtered.map(item => {
              const qty = cartQty(item.id);
              return (
                <div key={item.id} className="menu-item">
                  <div className="menu-category">{item.category}</div>
                  <h3>{item.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <div className="menu-price">₹{item.price}</div>
                    {qty === 0 ? (
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => addToCart(item)}>
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div className="cart-qty-controls">
                        <button className="qty-btn" onClick={() => removeFromCart(item.id)}><Minus size={12} /></button>
                        <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                        <button className="qty-btn" onClick={() => addToCart(item)}><Plus size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CART */}
        <div className="cart-sidebar">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={20} color="var(--primary)" /> Your Order
          </h2>

          {/* Hotel Selection */}
          <div className="form-group">
            <label>Select Hotel</label>
            <select className="form-input" value={hotel} onChange={e => setHotel(e.target.value)}>
              <option value="">— Choose Hotel —</option>
              {HOTELS.map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Room Number */}
          <div className="form-group">
            <label>Room Number</label>
            <input className="form-input" type="text" placeholder="e.g. 101" value={room}
              onChange={e => setRoom(e.target.value)} />
          </div>

          <div style={{ minHeight: '160px', marginTop: '0.5rem' }}>
            {cart.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '2.5rem', fontSize: '0.9rem' }}>
                <Utensils size={32} style={{ marginBottom: '0.5rem', opacity: 0.3 }} /><br />No items added yet
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>₹{item.price} × {item.qty}</div>
                  </div>
                  <div className="cart-qty-controls">
                    <button className="qty-btn" onClick={() => removeFromCart(item.id)}><Minus size={12} /></button>
                    <span style={{ fontWeight: 600 }}>{item.qty}</span>
                    <button className="qty-btn" onClick={() => addToCart(item)}><Plus size={12} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-total">
            <span>Total</span>
            <span className="amount">₹{total.toLocaleString()}</span>
          </div>

          <button className="btn btn-primary btn-full" onClick={placeOrder}
            style={{ padding: '0.9rem', fontSize: '0.95rem', marginTop: '1rem' }}
            disabled={cart.length === 0}>
            <Coffee size={16} /> Place Order
          </button>
        </div>
      </div>

      {/* ORDER HISTORY */}
      {orders.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-title">
            <ClipboardList size={18} color="var(--primary)" /> Order History ({orders.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <div key={order.id} style={{
                background: 'var(--bg-surface)', borderRadius: 12, padding: '1.25rem',
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'Playfair Display, serif', fontSize: '1rem' }}>
                      {order.hotel}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Room #{order.room}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {order.time} • {order.date}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      ₹{order.total.toLocaleString()}
                    </span>
                    {order.status === 'Preparing' ? (
                      <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Coffee size={12} /> Preparing
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={12} /> Delivered
                      </span>
                    )}
                  </div>
                </div>
                <div className="table-container" style={{ margin: 0 }}>
                  <table style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr><th>Item</th><th>Category</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                      {order.items.map(item => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: 500 }}>{item.name}</td>
                          <td><span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{item.category}</span></td>
                          <td>₹{item.price}</td>
                          <td style={{ fontWeight: 600 }}>×{item.qty}</td>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>₹{(item.price * item.qty).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default FoodOrder;
