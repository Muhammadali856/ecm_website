// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Popup from '../components/Popup';

function HomePage({ addToCart, user }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products!", error);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCartClick = (product) => {
    if (!user) {
      setPopupMessage("Please log in or sign up to add items to your cart.");
    } else {
      addToCart(product);
    }
  };

  const handlePopupClose = () => {
    setPopupMessage('');
    navigate('/login');
  };

  return (
    <div className="page-container">
      <Popup message={popupMessage} onConfirm={handlePopupClose} />

      <h1 className="page-title">Our Health Care Products</h1>

      <input
        type="text"
        placeholder="Search for a product..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {loading ? (
        <p className="loading-text">Loading products...</p>
      ) : (
        <div className="grid-container">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={handleAddToCartClick} />
            ))
          ) : (
            <p className="empty-state">No products found matching your search.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;