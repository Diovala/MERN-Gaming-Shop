import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../contexts/MyProvider.jsx';

const Cart = () => {
  const navigate = useNavigate();
  
  const context = React.useContext(MyContext);

  if (!context) {
    console.warn("Cart: MyContext is undefined. Check if MyProvider wraps this component.");
    return <div className="loading">Đang tải dữ liệu giỏ hàng...</div>;
  }


  const { cart, updateQuantity, removeFromCart, token } = context;

  // Tính tổng tiền
  const totalAmount = cart.reduce((total, item) => {
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    return total + (price * item.quantity);
  }, 0);

  if (!cart || cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>🛒 Giỏ hàng trống</h2>
        <Link to="/" className="btn-gaming" style={{ marginTop: '20px', display: 'inline-block' }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#e60012' }}>GIỎ HÀNG CỦA BẠN</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Danh sách sản phẩm */}
        <div>
          {cart.map(item => {
            const price = item.discountPrice > 0 ? item.discountPrice : item.price;
            return (
              <div key={item._id} style={{ display: 'flex', gap: '15px', background: '#1a1a1a', padding: '15px', marginBottom: '10px', border: '1px solid #333' }}>
                <img 
                  src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/80'} 
                  alt={item.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                />
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>{item.name}</h3>
                  <p style={{ color: '#e60012', fontWeight: 'bold' }}>{price.toLocaleString('vi-VN')} ₫</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ background: '#333', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ background: '#333', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '5px 10px', cursor: 'pointer' }}>
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tổng kết */}
        <div style={{ background: '#1a1a1a', padding: '20px', height: 'fit-content', border: '1px solid #333' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>TỔNG ĐƠN HÀNG</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
            <span>Tổng tiền:</span>
            <span style={{ color: '#e60012' }}>{totalAmount.toLocaleString('vi-VN')} ₫</span>
          </div>
          <button 
            className="btn-gaming" 
            style={{ width: '100%', fontSize: '16px' }}
            onClick={() => {
              if (!token) {
                alert('Vui lòng đăng nhập để thanh toán!');
                navigate('/login');
              } else {
                navigate('/checkout');
              }
            }}
          >
            THANH TOÁN NGAY
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;