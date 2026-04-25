import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../contexts/MyProvider.jsx'; 

const Checkout = () => {
  const { cart, user, token, clearCart } = useContext(MyContext);
  const navigate = useNavigate();
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  // ✅ XỬ LÝ TỐT HƠN - Không return null
  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', background: '#0a0a0a', minHeight: '80vh' }}>
        <h2 style={{ color: '#e60012', fontSize: '32px', marginBottom: '20px' }}>🔒 BẠN CẦN ĐĂNG NHẬP</h2>
        <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '16px' }}>Vui lòng đăng nhập để tiếp tục thanh toán</p>
        <Link to="/login" className="btn-gaming" style={{ fontSize: '16px', padding: '12px 30px' }}>
          ĐĂNG NHẬP NGAY
        </Link>
        <br />
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', background: 'transparent', color: '#666', border: '1px solid #333', padding: '10px 20px', cursor: 'pointer' }}>
          ← Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', background: '#0a0a0a', minHeight: '80vh' }}>
        <h2 style={{ color: '#e60012', fontSize: '32px', marginBottom: '20px' }}>🛒 GIỎ HÀNG TRỐNG</h2>
        <Link to="/" className="btn-gaming" style={{ marginTop: '20px', display: 'inline-block' }}>MUA SẮM NGAY</Link>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!address || !phone) return alert('Vui lòng nhập đầy đủ Địa chỉ và Số điện thoại!');
    
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress: address,
        paymentMethod: 'COD'
      };

      const res = await axios.post('http://localhost:5000/api/customer/orders', orderData, {
        headers: { 'x-access-token': token }
      });

      if (res.data.success) {
        alert('🎉 Đặt hàng thành công!');
        clearCart();
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce((total, item) => {
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    return total + (price * item.quantity);
  }, 0);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ color: '#e60012', marginBottom: '20px' }}>THÔNG TIN THANH TOÁN</h2>
      
      <div style={{ background: '#1a1a1a', padding: '20px', border: '1px solid #333', marginBottom: '20px' }}>
        <p style={{ marginBottom: '10px' }}>👤 <strong>Khách hàng:</strong> {user?.fullName}</p>
      </div>

      <div style={{ background: '#1a1a1a', padding: '20px', border: '1px solid #333' }}>
        <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>📍 Địa chỉ nhận hàng</label>
        <input 
          type="text" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Nhập địa chỉ..."
          style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#000', border: '1px solid #333', color: 'white' }}
        />

        <label style={{ display: 'block', marginBottom: '10px', color: '#aaa' }}>📱 Số điện thoại</label>
        <input 
          type="text" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập SĐT..."
          style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#000', border: '1px solid #333', color: 'white' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
          <span>Tổng thanh toán:</span>
          <span style={{ color: '#e60012' }}>{totalAmount.toLocaleString('vi-VN')} ₫</span>
        </div>

        <button 
          className="btn-gaming" 
          style={{ width: '100%', fontSize: '18px' }}
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;