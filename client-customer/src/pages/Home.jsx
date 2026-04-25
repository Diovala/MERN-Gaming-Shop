import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner.jsx';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/customer/products')
      .then(res => {
        setProducts(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải sản phẩm:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Đang tải kho đồ Gaming...</div>;

  return (
    <div>
      <HeroBanner />
      
      <h2 style={{ 
        fontSize: '32px', 
        marginBottom: '30px', 
        color: '#e60012',
        textTransform: 'uppercase',
        borderBottom: '3px solid #e60012',
        display: 'inline-block',
        paddingBottom: '10px'
      }}>
        🔥 SẢN PHẨM NỔI BẬT
      </h2>

      <div className="product-grid" id="product-grid">
        {products.map(p => {
          const hasDiscount = p.discountPrice > 0;
          const displayPrice = hasDiscount ? p.discountPrice : p.price;
          
          return (
            <div key={p._id} className="product-card">
              {hasDiscount && <div className="product-badge">SALE</div>}
              
              <div className="product-image">
                {p.images && p.images.length > 0 ? (
                  <img src={p.images[0]} alt={p.name} />
                ) : (
                  <div style={{ color: '#444', fontSize: '48px' }}>🖥️</div>
                )}
              </div>

              <div className="product-info">
                <h3 className="product-name">{p.name}</h3>
                
                <div className="product-price">
                  {displayPrice.toLocaleString('vi-VN')} ₫
                  {hasDiscount && (
                    <span className="product-old-price">
                      {p.price.toLocaleString('vi-VN')} ₫
                    </span>
                  )}
                </div>

                <Link to={`/product/${p._id}`} className="btn-view-detail">
                  XEM CHI TIẾT
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;