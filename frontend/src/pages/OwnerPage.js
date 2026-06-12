// src/pages/OwnerPage.js
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

function OwnerPage({ user }) {
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  // ── Add-product form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [message, setMessage] = useState('');

  // ── Delete confirmation pop-up
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ── Edit modal state
  // editProduct holds the full product object currently being edited,
  // or null when the modal is closed.
  const [editProduct, setEditProduct] = useState(null);
  // Separate controlled fields for the edit form
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'orders' && user && user.is_staff) {
      axios.post('http://127.0.0.1:8000/api/admin/all-orders/', { email: user.email })
        .then(res => setOrders(res.data))
        .catch(err => console.error(err));
    }

    if (activeTab === 'products') {
      axios.get('http://127.0.0.1:8000/api/products/')
        .then(res => setProducts(res.data))
        .catch(err => console.error("Failed to load products"));
    }
  }, [activeTab, user]);

  if (!user || !user.is_staff) {
    return <Navigate to="/" />;
  }

  // ── Add product ─────────────────────────────────────────────
  const handleAddProduct = (e) => {
    e.preventDefault();
    setMessage('');

    axios.post('http://127.0.0.1:8000/api/admin/add-product/', {
      email: user.email,
      name, description, price, image_url: imageUrl, is_active: true
    })
    .then(res => {
      setMessage('Product added successfully to the storefront!');
      setProducts([...products, res.data]);
      setName(''); setDescription(''); setPrice(''); setImageUrl('');
    })
    .catch(err => {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const errorField = Object.keys(errorData)[0];
        setMessage(`Error in ${errorField}: ${errorData[errorField]}`);
      } else {
        setMessage('Failed to add product.');
      }
    });
  };

  // ── Delete helpers ───────────────────────────────────────────
  const openDeletePopup = (id) => setDeleteConfirmId(id);
  const closeDeletePopup = () => setDeleteConfirmId(null);

  const executeDelete = () => {
    if (!deleteConfirmId) return;

    axios.post(`http://127.0.0.1:8000/api/admin/delete-product/${deleteConfirmId}/`, {
      email: user.email
    })
    .then(() => {
      setProducts(products.filter(p => p.id !== deleteConfirmId));
      setMessage('Product deleted successfully!');
      setDeleteConfirmId(null);
    })
    .catch(err => {
      console.error(err);
      setMessage('Failed to delete product.');
      setDeleteConfirmId(null);
    });
  };

  // ── Edit helpers ─────────────────────────────────────────────
  // Open the modal and pre-fill fields with the selected product's data
  const openEditModal = (product) => {
    setEditProduct(product);
    setEditName(product.name);
    setEditDescription(product.description);
    setEditPrice(product.price);
    setEditImageUrl(product.image_url || '');
    setEditMessage('');
  };

  const closeEditModal = () => {
    setEditProduct(null);
    setEditMessage('');
  };

  // Submit the edit — calls PUT /admin/update-product/<pk>/
  const handleUpdateProduct = (e) => {
    e.preventDefault();
    setEditMessage('');

    axios.put(`http://127.0.0.1:8000/api/admin/update-product/${editProduct.id}/`, {
      email: user.email,
      name: editName,
      description: editDescription,
      price: editPrice,
      image_url: editImageUrl,
      is_active: true,
    })
    .then(res => {
      // Replace the stale entry in the products list with the fresh data
      setProducts(products.map(p => p.id === res.data.id ? res.data : p));
      setMessage('Product updated successfully!');
      closeEditModal();
    })
    .catch(err => {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        const errorField = Object.keys(errorData)[0];
        setEditMessage(`Error in ${errorField}: ${errorData[errorField]}`);
      } else {
        setEditMessage('Failed to update product.');
      }
    });
  };

  return (
    <div className="dashboard-container">

      {/* ── DELETE CONFIRMATION POPUP ── */}
      {deleteConfirmId && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3 className="popup-title">Confirm Deletion</h3>
            <p className="popup-body">
              Are you sure you want to completely remove this product from the storefront?
            </p>
            <div className="popup-actions">
              <button onClick={closeDeletePopup} className="btn-secondary">
                Cancel
              </button>
              <button onClick={executeDelete} className="btn-danger">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PRODUCT POPUP ── */}
      {editProduct && (
        <div className="popup-overlay">
          <div className="popup-content" style={{ maxWidth: '520px', width: '100%' }}>
            <h3 className="popup-title">Edit Product</h3>

            {editMessage && (
              <p className={`form-message ${
                editMessage.includes('Error') || editMessage.includes('Failed')
                  ? 'form-message--error'
                  : 'form-message--success'
              }`}>
                {editMessage}
              </p>
            )}

            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL:</label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea
                  rows="4"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="popup-actions" style={{ marginTop: '8px' }}>
                <button type="button" onClick={closeEditModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h1 className="dashboard-heading">Owner Dashboard</h1>

      {/* ── TAB NAVIGATION ── */}
      <div className="tab-nav">
        <button
          onClick={() => setActiveTab('products')}
          className={`tab-btn ${activeTab === 'products' ? 'tab-btn--active' : ''}`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`tab-btn ${activeTab === 'orders' ? 'tab-btn--active' : ''}`}
        >
          View All Customer Orders
        </button>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {activeTab === 'products' && (
        <div className="tab-panel">

          {/* Add Product Form */}
          <div className="form-card">
            <h3 className="section-heading">Add New Product</h3>

            {message && (
              <p className={`form-message ${
                message.includes('Error') || message.includes('Failed')
                  ? 'form-message--error'
                  : 'form-message--success'
              }`}>
                {message}
              </p>
            )}

            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Product Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($):</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL:</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary btn-full-width">
                Add to Storefront
              </button>
            </form>
          </div>

          {/* Products Table */}
          <div className="table-section">
            <h3 className="section-heading">Current Storefront Products</h3>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr className="table-header-row">
                    <th className="table-th">ID</th>
                    <th className="table-th">Product Name</th>
                    <th className="table-th table-th--center">Price</th>
                    <th className="table-th table-th--center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map(product => (
                      <tr key={product.id} className="table-row">
                        <td className="table-td table-td--center table-td--id">{product.id}</td>
                        <td className="table-td">{product.name}</td>
                        <td className="table-td table-td--center table-td--amount">${product.price}</td>
                        <td className="table-td table-td--center">
                          {/* Edit button — opens the pre-filled edit modal */}
                          <button
                            onClick={() => openEditModal(product)}
                            className="btn-secondary btn-danger--sm"
                            style={{ marginRight: '8px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeletePopup(product.id)}
                            className="btn-danger btn-danger--sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="table-empty">
                        No active products in the store.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {activeTab === 'orders' && (
        <div className="tab-panel">
          <div className="table-container">
            <table className="data-table data-table--wide">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th">Customer Email</th>
                  <th className="table-th">Delivery Address</th>
                  <th className="table-th">Product</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="table-row">
                    <td className="table-td">{order.customer}</td>
                    <td className="table-td table-td--address">{order.address}</td>
                    <td className="table-td">{order.product}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default OwnerPage;