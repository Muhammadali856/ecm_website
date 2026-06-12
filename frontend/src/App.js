// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import OwnerPage from './pages/OwnerPage';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState([]);
  
  // NEW: The "Traffic Light" to stop the race condition
  const [isCartLoaded, setIsCartLoaded] = useState(false); 

  // 1. Load the cart FIRST
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.email}`);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } else {
      setCart([]);
    }
    setIsCartLoaded(true); // Turn the light green
  }, [user]);

  // 2. ONLY save the cart if the light is green
  useEffect(() => {
    if (isCartLoaded && user) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    }
  }, [cart, user, isCartLoaded]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  // 3. New function to remove a single item
  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      localStorage.removeItem(`cart_${user.email}`);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]); // Instantly clear the cart from the screen
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="App">
        <Navbar cartCount={cart.length} user={user} handleLogout={handleLogout} />
        
        <Routes>
          <Route path="/" element={<HomePage addToCart={addToCart} user={user} />} />
          
          {/* Add user={user} here */}
          <Route path="/cart" element={<CartPage cart={cart} clearCart={clearCart} removeFromCart={removeFromCart} user={user} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/product/:id" element={<ProductDetailPage user={user} addToCart={addToCart} />} />
          <Route path="/owner" element={<OwnerPage user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;