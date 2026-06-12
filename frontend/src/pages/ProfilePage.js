// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';

function ProfilePage({ user }) {
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      axios.post('http://127.0.0.1:8000/api/my-orders/', { email: user.email })
        .then(res => {
          setOrders(res.data);
          setLoadingOrders(false);
        })
        .catch(err => {
          console.error("Failed to fetch orders", err);
          setLoadingOrders(false);
        });
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setMessage('');

    axios.post('http://127.0.0.1:8000/api/update-profile/', {
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      address: address,
      password: password
    })
    .then(response => {
      setMessage('Profile updated successfully!');
      setPassword(''); 
      localStorage.setItem('user', JSON.stringify(response.data.user));
    })
    .catch(error => {
      setMessage('Failed to update profile.');
      console.error(error);
    });
  };

  return (
    <div className="page-container">
      
      <div className="mb-md">
        <h1 className="page-title">My Profile</h1>
        <p className="profile-subtitle">Manage your personal information and track your recent orders.</p>
      </div>

      <div className="profile-dashboard">
        <div className="profile-card">
          <h2 className="profile-section-title">Personal Information</h2>
          
          {message && (
            <p className={`form-message ${message.includes('Failed') ? 'form-message--error' : 'form-message--success'}`}>
              {message}
            </p>
          )}
          
          <form onSubmit={handleUpdateProfile} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="form-input" />
              </div>
            </div>

            <div className="form-group mt-sm">
              <label className="form-label">Email Address</label>
              <input type="email" value={user.email} disabled className="form-input input-disabled" />
              <span className="text-muted mt-sm" style={{display: "block", fontSize: "0.75rem"}}>Email cannot be changed.</span>
            </div>

            <div className="form-group mt-sm">
              <label className="form-label">Delivery Address</label>
              <textarea rows="3" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Required for shipping..." className="form-input" />
            </div>

            <hr className="settings-divider" />
            <h3 className="settings-subheading">Change Password</h3>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password (optional)" className="form-input" />
            </div>
            <div className="mt-md">
              <button type="submit" className="btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
        <div className="profile-card">
          <h2 className="profile-section-title">My Orders</h2>
          
          {loadingOrders ? (
            <p className="loading-text">Loading your orders...</p>
          ) : orders.length > 0 ? (
            <div className="order-list">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-card__info">
                    {order.product_image ? (
                      <img src={order.product_image} alt={order.product_name} className="order-card__thumb" />
                    ) : (
                      <div className="order-card__thumb-placeholder">No Img</div>
                    )}
                    <div className="order-card__details">
                      <h4 className="order-card__name">{order.product_name}</h4>
                      <p className="order-card__meta">Order #{order.id} • {order.date}</p>
                      <p className="order-card__status">${order.total_amount} • {order.status}</p>
                    </div>
                  </div>
                  <Link to={`/product/${order.product_id}`} className="btn-secondary btn-sm">Review</Link>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="orders-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b0bbc8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-sm">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3>No orders yet</h3>
              <p className="text-muted mt-sm mb-md">When you purchase items, they will appear here.</p>
              <Link to="/" className="btn-secondary">Explore Products</Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;