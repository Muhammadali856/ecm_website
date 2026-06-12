// src/pages/ProductDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductDetailPage({ user, addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/products/${id}/`)
      .then(res => setProduct(res.data))
      .catch(err => console.error("Failed to load product", err));
  }, [id]);

  const handleBuyNow = () => {
    if (!user) {
      alert("Please log in to buy items.");
      navigate('/login');
      return;
    }
    addToCart(product);
    navigate('/cart');
  };

  const handleAddToCart = () => {
    if (!user) {
      alert("Please log in to add items.");
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackError('');
    setFeedbackSuccess('');

    if (!user) {
      setFeedbackError('You must be logged in to leave feedback.');
      return;
    }

    axios.post(`http://127.0.0.1:8000/api/products/${id}/feedback/`, {
      email: user.email,
      message: feedbackText
    })
    .then(res => {
      setFeedbackSuccess(res.data.message);
      setFeedbackText('');
      axios.get(`http://127.0.0.1:8000/api/products/${id}/`).then(r => setProduct(r.data));
    })
    .catch(err => {
      setFeedbackError(err.response?.data?.error || 'Failed to submit feedback.');
    });
  };

  if (!product) return <div className="page-container"><h2>Loading product...</h2></div>;

  return (
    <div className="page-container product-detail-page">

      {/* ── Product Hero Card ── */}
      <div className="product-detail-card">

        {/* Left: Image */}
        <div className="product-detail-image-col">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-detail-img"
            />
          ) : (
            <div className="product-detail-img-placeholder">No Image</div>
          )}
        </div>

        {/* Right: Info */}
        <div className="product-detail-info-col">
          <h1 className="product-detail-name">{product.name}</h1>
          <h2 className="product-detail-price">${product.price}</h2>
          <p className="product-detail-description">{product.description}</p>

          <div className="product-detail-actions">
            <button onClick={handleAddToCart} className="btn-secondary">Add To Cart</button>
            <button onClick={handleBuyNow} className="btn-primary">Buy Now</button>
          </div>
        </div>

      </div>

      {/* ── Reviews Section ── */}
      <div className="reviews-section">
        <h3 className="reviews-section__title">Product Reviews</h3>

        {/* Leave a Review form */}
        <div className="review-form-container">
          <h4>Leave a Review</h4>
          <form onSubmit={handleFeedbackSubmit} className="review-form">
            <textarea
              rows="3"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your experience (Verified Buyers Only)..."
              className="form-input"
              required
            />
            <button type="submit" className="btn-primary review-submit-btn">Submit Review</button>
          </form>
          {feedbackError   && <p className="feedback-message feedback-message--error">{feedbackError}</p>}
          {feedbackSuccess && <p className="feedback-message feedback-message--success">{feedbackSuccess}</p>}
        </div>

        {/* Existing reviews list */}
        {product.feedbacks.length > 0 ? (
          product.feedbacks.map((fb, idx) => (
            <div key={idx} className="review-item">
              <strong className="review-author">{fb.user}</strong>
              <span className="review-date">{fb.date}</span>
              <p className="review-message">{fb.message}</p>
            </div>
          ))
        ) : (
          <p className="reviews-empty">No reviews yet. Buy this product to be the first to review!</p>
        )}

      </div>

    </div>
  );
}

export default ProductDetailPage;