import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FileText, CreditCard, Banknote, Smartphone, Globe, CheckCircle2, Building2, CalendarDays, Receipt, Printer } from 'lucide-react';

const API_BOOKINGS = `${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/bookings`;
const API_ROOMS = `${process.env.REACT_APP_API_URL || 'http://localhost:8082'}/rooms`;
const TAX = 0.18;

const Checkout = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [receipts, setReceipts] = useState([]);

  // Payment detail fields
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({ bank: '', accountNo: '', ifsc: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, rRes] = await Promise.all([fetch(API_BOOKINGS), fetch(API_ROOMS)]);
        if (bRes.ok) setBookings(await bRes.json());
        if (rRes.ok) setRooms(await rRes.json());
      } catch { /* silent */ }
    };
    fetchData();
  }, []);

  const booking = bookings.find(b => b.id === parseInt(selectedId));

  const getRoomPrice = (roomType) => {
    const clean = roomType?.replace(/\s*\(Room #.*\)/, '');
    const room = rooms.find(r => r.roomType === clean);
    if (room) return room.price;
    const prices = { Single: 1000, Double: 2000, Deluxe: 2500, Suite: 2500, 'Lagoon Villa': 5000, 'Ocean Villa': 8000, 'Royal Suite': 15000 };
    return prices[clean] || 2500;
  };

  const getNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const diff = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const nights = booking ? getNights(booking.checkIn, booking.checkOut) : 0;
  const roomPrice = booking ? getRoomPrice(booking.roomType) : 0;
  const roomCharges = roomPrice * nights;
  const serviceCharge = Math.round(roomCharges * 0.05);
  const subtotal = roomCharges + serviceCharge;
  const tax = Math.round(subtotal * TAX);
  const total = subtotal + tax;

  const methodLabel = { cash: 'Cash', card: 'Credit/Debit Card', upi: 'UPI', online: 'Online Banking' };

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const validatePayment = () => {
    if (method === 'card') {
      if (cardDetails.number.replace(/\s/g, '').length < 16) { toast.error('Enter a valid 16-digit card number.', { theme: 'dark' }); return false; }
      if (!cardDetails.name.trim()) { toast.error('Enter cardholder name.', { theme: 'dark' }); return false; }
      if (cardDetails.expiry.length < 5) { toast.error('Enter valid expiry (MM/YY).', { theme: 'dark' }); return false; }
      if (cardDetails.cvv.length < 3) { toast.error('Enter valid CVV.', { theme: 'dark' }); return false; }
    }
    if (method === 'upi') {
      if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID (e.g. name@upi).', { theme: 'dark' }); return false; }
    }
    if (method === 'online') {
      if (!bankDetails.bank) { toast.error('Select a bank.', { theme: 'dark' }); return false; }
      if (bankDetails.accountNo.length < 8) { toast.error('Enter a valid account number.', { theme: 'dark' }); return false; }
      if (bankDetails.ifsc.length < 6) { toast.error('Enter a valid IFSC code.', { theme: 'dark' }); return false; }
    }
    return true;
  };

  const getPaymentInfo = () => {
    if (method === 'card') return `Card ending ****${cardDetails.number.replace(/\s/g, '').slice(-4)}`;
    if (method === 'upi') return `UPI: ${upiId}`;
    if (method === 'online') return `${bankDetails.bank} A/c: ****${bankDetails.accountNo.slice(-4)}`;
    return 'Cash at Front Desk';
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (!booking) { toast.error('Please select a booking.', { theme: 'dark' }); return; }
    if (!validatePayment()) return;
    setProcessing(true);
    setTimeout(() => {
      const receipt = {
        id: `INV-${Date.now().toString().slice(-6)}`,
        guestName: booking.customerName,
        roomType: booking.roomType,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        nights,
        roomCharges,
        serviceCharge,
        subtotal,
        tax,
        total,
        method: methodLabel[method],
        paymentInfo: getPaymentInfo(),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN'),
      };
      setReceipts(prev => [receipt, ...prev]);
      setProcessing(false);
      toast.success(`✅ Payment of ₹${total.toLocaleString()} via ${methodLabel[method]} successful!`, { theme: 'dark' });
      setSelectedId('');
      setCardDetails({ number: '', name: '', expiry: '', cvv: '' });
      setUpiId('');
      setBankDetails({ bank: '', accountNo: '', ifsc: '' });
    }, 1500);
  };

  const paymentOptions = [
    { id: 'cash', label: 'Cash Payment', desc: 'Pay at the front desk', icon: <Banknote size={22} /> },
    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex', icon: <CreditCard size={22} /> },
    { id: 'upi', label: 'UPI Payment', desc: 'GPay, PhonePe, Paytm', icon: <Smartphone size={22} /> },
    { id: 'online', label: 'Online Banking', desc: 'Net banking transfer', icon: <Globe size={22} /> },
  ];

  return (
    <main className="main-content">
      <div className="page-header">
        <div>
          <h1>Checkout & Billing</h1>
          <p>Generate invoice from real bookings and process guest payments.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Invoice */}
        <div className="card">
          <div className="card-title"><FileText size={18} color="var(--primary)" /> Invoice</div>

          <div className="form-group">
            <label>Select Guest Booking</label>
            <select className="form-input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">— Choose a booking —</option>
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.customerName} — {b.roomType} ({b.checkIn} to {b.checkOut})
                </option>
              ))}
            </select>
          </div>

          {bookings.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem', textAlign: 'center' }}>
              No bookings found. Create a booking first from the Bookings page.
            </div>
          )}

          {booking && (
            <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: '1.25rem', marginTop: '0.5rem', border: '1px solid var(--border)' }}>
              {/* Guest + Room info */}
              <div style={{ borderBottom: '1px dashed var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                  {booking.customerName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={14} /> {booking.roomType}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, marginTop: '4px' }}>
                  <CalendarDays size={13} /> {booking.checkIn} → {booking.checkOut} ({nights} night{nights > 1 ? 's' : ''})
                </div>
              </div>

              {/* Breakdown */}
              {[
                { label: `Room (₹${roomPrice.toLocaleString()} × ${nights} night${nights > 1 ? 's' : ''})`, value: roomCharges },
                { label: 'Service Charge (5%)', value: serviceCharge },
                { label: `GST (${TAX * 100}%)`, value: tax },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>{row.label}</span>
                  <span>₹{row.value.toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-primary)', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: 700, fontSize: '1.3rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)', fontFamily: 'Playfair Display, serif' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="card">
          <div className="card-title"><CreditCard size={18} color="var(--primary)" /> Payment Method</div>
          <form onSubmit={handlePay}>
            {paymentOptions.map(opt => (
              <label key={opt.id} className={`payment-option ${method === opt.id ? 'selected' : ''}`}
                onClick={() => setMethod(opt.id)}>
                <input type="radio" name="payment" value={opt.id} checked={method === opt.id} onChange={() => setMethod(opt.id)} />
                <span style={{ color: method === opt.id ? 'var(--primary)' : 'var(--text-secondary)' }}>{opt.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}

            {/* Payment Detail Forms */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
              {method === 'cash' && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '0.5rem', fontSize: '0.9rem' }}>
                  💵 Cash payment will be collected at the front desk during checkout.
                </div>
              )}

              {method === 'card' && (
                <div className="animate-fadeIn">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary)' }}>
                    💳 Card Details
                  </div>
                  <div className="form-group" style={{ margin: '0 0 0.75rem 0' }}>
                    <label>Card Number</label>
                    <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                      value={cardDetails.number}
                      onChange={e => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })} />
                  </div>
                  <div className="form-group" style={{ margin: '0 0 0.75rem 0' }}>
                    <label>Cardholder Name</label>
                    <input className="form-input" placeholder="Name on card"
                      value={cardDetails.name}
                      onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Expiry (MM/YY)</label>
                      <input className="form-input" placeholder="MM/YY" maxLength={5}
                        value={cardDetails.expiry}
                        onChange={e => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>CVV</label>
                      <input className="form-input" type="password" placeholder="•••" maxLength={4}
                        value={cardDetails.cvv}
                        onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                    </div>
                  </div>
                </div>
              )}

              {method === 'upi' && (
                <div className="animate-fadeIn">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary)' }}>
                    📱 UPI Details
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>UPI ID</label>
                    <input className="form-input" placeholder="yourname@upi / 9876543210@paytm"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Supported: Google Pay, PhonePe, Paytm, BHIM
                  </div>
                </div>
              )}

              {method === 'online' && (
                <div className="animate-fadeIn">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--primary)' }}>
                    🏦 Bank Details
                  </div>
                  <div className="form-group" style={{ margin: '0 0 0.75rem 0' }}>
                    <label>Select Bank</label>
                    <select className="form-input" value={bankDetails.bank}
                      onChange={e => setBankDetails({ ...bankDetails, bank: e.target.value })}>
                      <option value="">— Choose Bank —</option>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Bank of Baroda</option>
                      <option>Punjab National Bank</option>
                      <option>Yes Bank</option>
                      <option>IndusInd Bank</option>
                      <option>Canara Bank</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Account Number</label>
                      <input className="form-input" placeholder="Enter account number"
                        value={bankDetails.accountNo}
                        onChange={e => setBankDetails({ ...bankDetails, accountNo: e.target.value.replace(/\D/g, '') })} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>IFSC Code</label>
                      <input className="form-input" placeholder="e.g. SBIN0001234" style={{ textTransform: 'uppercase' }}
                        value={bankDetails.ifsc}
                        onChange={e => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full"
              style={{ padding: '1rem', fontSize: '1rem', marginTop: '1rem' }}
              disabled={!booking || processing}>
              {processing ? 'Processing...' : `Confirm Payment${booking ? ` — ₹${total.toLocaleString()}` : ''}`}
            </button>
          </form>
        </div>
      </div>

      {/* Payment Receipts */}
      {receipts.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-title"><Receipt size={18} color="var(--primary)" /> Payment Receipts ({receipts.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {receipts.map(r => (
              <div key={r.id} style={{
                background: 'var(--bg-surface)', borderRadius: 12, padding: '1.5rem',
                border: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute', top: 20, right: -12,
                  transform: 'rotate(30deg)',
                  fontSize: '3.5rem', fontWeight: 900, fontFamily: 'Playfair Display, serif',
                  color: 'rgba(46,204,113,0.06)', pointerEvents: 'none', letterSpacing: 8
                }}>PAID</div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: '2px' }}>
                      {r.guestName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Invoice: {r.id} • {r.date} at {r.time}
                    </div>
                  </div>
                  <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={12} /> Paid
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Room</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{r.roomType}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Stay</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{r.checkIn} → {r.checkOut}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Payment</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{r.method}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.paymentInfo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Nights</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{r.nights}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>Room Charges</span><span>₹{r.roomCharges.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    <span>Service Charge</span><span>₹{r.serviceCharge.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <span>GST (18%)</span><span>₹{r.tax.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-primary)', paddingTop: '0.5rem', fontWeight: 700, fontSize: '1.2rem' }}>
                    <span>Total Paid</span>
                    <span style={{ color: 'var(--primary)', fontFamily: 'Playfair Display, serif' }}>₹{r.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Checkout;
