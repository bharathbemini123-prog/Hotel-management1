import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Hotels from './pages/Hotels';
import Bookings from './pages/Bookings';
import Customers from './pages/Customers';
import Checkout from './pages/Checkout';
import FoodOrder from './pages/FoodOrder';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <>
        <Login onLogin={setUser} />
        <ToastContainer theme="dark" position="bottom-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="dashboard-container">
        <Sidebar user={user} onLogout={() => setUser(null)} />
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/hotels" element={<Hotels user={user} />} />
          <Route path="/bookings" element={<Bookings user={user} />} />
          <Route path="/customers" element={<Customers user={user} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/food-order" element={<FoodOrder />} />
          <Route path="/profile" element={<Profile user={user} onUpdateUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ToastContainer theme="dark" position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;