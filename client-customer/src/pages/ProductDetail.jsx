import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../contexts/MyProvider.jsx'; 

const ProductDetail = () => {
  const { id } = useParams();
  const context = useContext(MyContext); // ✅ Lấy context
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState('');

  // ✅ Defensive: Kiểm tra context có tồn tại
  const addToCart = context?.addToCart || (() => {});

  useEffect(() => {
    axios.get(`http://localhost:5000/api/customer/products/${id}`)
      .then(res => {
        setProduct(res.data.data);
        if (res.data.data.images && res.data.data.images.length > 0) {
          setActiveImg(res.data.data.images[0]);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="loading">Đang tìm sản phẩm...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
      {/* Cột trái: Ảnh */}
      <div>
        <div style={{ background: '#222', padding: '20px', marginBottom: '10px', textAlign: 'center' }}>
          <img src={activeImg} alt={product.name} style={{ maxHeight: '300px', maxWidth: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {product.images && product.images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt="thumb" 
              onClick={() => setActiveImg(img)}
              style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer', border: activeImg === img ? '2px solid #e60012' : '1px solid #333' }} 
            />
          ))}
        </div>
      </div>

      {/* Cột phải: Info & Specs */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{product.name}</h2>
        <p style={{ fontSize: '28px', color: '#e60012', fontWeight: 'bold', marginBottom: '20px' }}>
          {product.price.toLocaleString('vi-VN')} ₫
        </p>

        <button 
          className="btn-gaming" 
          style={{ width: '100%', fontSize: '18px', marginBottom: '30px' }}
          onClick={() => addToCart(product)}
        >
          🛒 THÊM VÀO GIỎ HÀNG
        </button>

        <div style={{ background: '#1a1a1a', padding: '20px', border: '1px solid #333' }}>
          <h3 style={{ marginBottom: '15px', color: '#e60012' }}>⚙️ THÔNG SỐ KỸ THUẬT</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {product.specs && product.specs.map((spec, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '10px', color: '#aaa', width: '40%' }}>{spec.k}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{spec.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;