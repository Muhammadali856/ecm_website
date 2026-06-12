// src/pages/CartPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CartPage({ cart, clearCart, removeFromCart, user }) {
  const [checkoutStatus, setCheckoutStatus] = useState('pending');
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState({ type: '', text: '' });
  const [addressRequired, setAddressRequired] = useState(false);

  const navigate = useNavigate();

  const subtotal = cart.reduce((total, item) => total + parseFloat(item.price), 0);
  const discountAmount = subtotal * (discount / 100);
  const finalPrice = subtotal - discountAmount;

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    setVoucherMessage({ type: '', text: '' });

    axios.post('http://127.0.0.1:8000/api/validate-voucher/', { code: voucherCode })
      .then(response => {
        setDiscount(response.data.discount_percentage);
        setVoucherMessage({ type: 'success', text: response.data.message });
      })
      .catch(error => {
        setDiscount(0);
        setVoucherMessage({ type: 'error', text: error.response?.data?.error || 'Invalid code' });
      });
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStatus('processing');
    setAddressRequired(false);

    axios.post('http://127.0.0.1:8000/api/checkout/', {
      email: user.email,
      cart: cart,
      final_price: finalPrice
    })
    .then(response => {
      setCheckoutStatus('success');
      clearCart();
      setDiscount(0);
      setVoucherCode('');
    })
    .catch(error => {
      setCheckoutStatus('pending');
      if (error.response && error.response.data.error === 'ADDRESS_REQUIRED') {
        setAddressRequired(true);
      } else {
        console.error("Checkout failed", error);
        alert("Checkout failed. Please try again.");
      }
    });
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Your Shopping Cart</h2>

      {cart.length === 0 && checkoutStatus === 'pending' ? (
        <p className="empty-state">Your cart is currently empty.</p>
      ) : (
        <div className="cart-content">

          {/* ── Item List ── */}
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="cart-item__info">
                <span className="cart-item__name">{item.name}</span>
                <strong className="cart-item__price">${item.price}</strong>
              </div>
              {checkoutStatus === 'pending' && (
                <button onClick={() => removeFromCart(index)} className="btn-danger btn-sm">
                  Remove
                </button>
              )}
            </div>
          ))}

          {/* ── Voucher Section ── */}
          {checkoutStatus === 'pending' && cart.length > 0 && (
            <div className="voucher-section">
              <div className="voucher-input-row">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Enter Promo Code"
                  className="form-input"
                />
                <button onClick={handleApplyVoucher} className="btn-primary">Apply</button>
              </div>
              {voucherMessage.text && (
                <p className={`voucher-message voucher-message--${voucherMessage.type}`}>
                  {voucherMessage.text} {voucherMessage.type === 'success' && `(${discount}% OFF)`}
                </p>
              )}
            </div>
          )}

          {/* ── Pricing Totals ── */}
          {checkoutStatus === 'pending' && (
            <div className="cart-totals">
              <p className="cart-totals__subtotal">Subtotal: ${subtotal.toFixed(2)}</p>
              {discount > 0 && (
                <p className="cart-totals__discount">Discount: -${discountAmount.toFixed(2)}</p>
              )}
              <h3 className="cart-totals__total">Total: ${finalPrice.toFixed(2)}</h3>
            </div>
          )}

        </div>
      )}

      {/* ── Address Required Warning ── */}
      {addressRequired && (
        <div className="address-warning">
          <h3 className="address-warning__title">Delivery Address Required</h3>
          <p className="address-warning__text">
            We need to know where to ship your products! Please add an address to your profile.
          </p>
          <button
            onClick={() => navigate('/profile', { state: { activeTab: 'settings' } })}
            className="btn-danger"
          >
            Go to Profile Settings
          </button>
        </div>
      )}

      {/* ── Checkout Button ── */}
      {checkoutStatus === 'pending' && cart.length > 0 && !addressRequired && (
        <div className="cart-actions">
          <button onClick={handleCheckout} className="btn-primary cart-checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      )}

      {checkoutStatus === 'processing' && (
        <p className="loading-text">Processing Secure Payment...</p>
      )}
      {checkoutStatus === 'success' && (
        <h3 className="checkout-success">Payment Successful! Order Confirmed.</h3>
      )}
    </div>
  );
}

export default CartPage;