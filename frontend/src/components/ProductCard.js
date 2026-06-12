import React from 'react';
import { Link } from 'react-router-dom';

function ProductCard({ product, addToCart }) {
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '5px', marginBottom: '15px' }} />
        ) : (
          <div style={{ width: '100%', height: '200px', backgroundColor: '#eaeaea', borderRadius: '5px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#7f8c8d' }}>No Image</span></div>
        )}
        <h3>{product.name}</h3>
        <h2 className="product-price">${product.price}</h2>
      </Link>
      
      <button className="btn-primary" onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
export default ProductCard;