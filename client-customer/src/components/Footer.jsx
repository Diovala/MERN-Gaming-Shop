const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Column 1: Contact */}
        <div className="footer-section">
          <h3>THÔNG TIN LIÊN HỆ</h3>
          <p>📍 Địa chỉ: 123 Đường Gaming, Quận 1, TP.HCM</p>
          <p>📞 Hotline: 1900 1234</p>
          <p>✉️ Email: support@gamingshop.vn</p>
          <p>🕐 Giờ làm: 8:00 - 22:00 (T2-CN)</p>
        </div>

        {/* Column 2: Policies */}
        <div className="footer-section">
          <h3>CHÍNH SÁCH KHÁCH HÀNG</h3>
          <ul>
            <li><a href="#">Chính sách bảo hành</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Chính sách vận chuyển</a></li>
            <li><a href="#">Chính sách thanh toán</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* Column 3: Social */}
        <div className="footer-section">
          <h3>THEO DÕI CHÚNG TÔI</h3>
          <p>Nhận thông tin khuyến mãi & sản phẩm mới</p>
          <div className="social-links">
            <div className="social-icon">📘</div>
            <div className="social-icon">📸</div>
            <div className="social-icon">🐦</div>
            <div className="social-icon">▶️</div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              style={{ 
                width: '100%', 
                padding: '10px', 
                background: '#1a1a1a', 
                border: '1px solid #333', 
                color: '#fff',
                marginBottom: '10px'
              }}
            />
            <button className="btn-gaming" style={{ width: '100%' }}>ĐĂNG KÝ</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Gaming Shop Vietnam. All rights reserved. | Designed for Educational Purpose</p>
      </div>
    </footer>
  );
};

export default Footer;