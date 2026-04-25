import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../contexts/MyProvider.jsx'; 

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: '',
      user: JSON.parse(localStorage.getItem('user')) || null // ✅ Load từ localStorage
    };
  }

  componentDidMount() {
    this.fetchCategories();
    
    // ✅ Lắng nghe sự kiện login/logout
    window.addEventListener('user-state-changed', this.handleUserStateChange);
  }

  componentWillUnmount() {
    window.removeEventListener('user-state-changed', this.handleUserStateChange);
  }

  // ✅ Hàm xử lý khi user state thay đổi
  handleUserStateChange = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    this.setState({ user });
  }

  fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/customer/categories');
      if (res.data.success) {
        this.setState({ categories: res.data.data });
      }
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
    }
  }

  btnSearchClick = (e) => {
    e.preventDefault();
    const { txtKeyword } = this.state;
    if (txtKeyword.trim()) {
      window.location.href = `/product/search/${txtKeyword.trim()}`;
    }
  }

  handleInputChange = (e) => {
    this.setState({ txtKeyword: e.target.value });
  }

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    
    // ✅ Reset state
    this.setState({ user: null });
    
    // ✅ Báo cho các component khác biết
    window.dispatchEvent(new Event('user-state-changed'));
    
    // ✅ Về trang chủ
    window.location.href = '/';
  }

  render() {
    const { categories, txtKeyword, user } = this.state;

    return (
      <>
        <div className="header-top">
          <div className="header-container">
            <Link to="/" className="logo">
              GAMING SHOP <span>.VN</span>
            </Link>

            <form onSubmit={this.btnSearchClick} className="search-box">
              <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm..." 
                value={txtKeyword}
                onChange={this.handleInputChange}
              />
              <button type="submit">🔍</button>
            </form>

            <div className="header-right">
              <Link to="/cart" className="cart-icon">
                🛒
              </Link>

              {user ? (
                <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link to="/myprofile" style={{ color: '#e60012', textDecoration: 'none', fontWeight: 'bold' }}>
                    👤 {user.fullName}
                  </Link>
                  <button onClick={this.handleLogout} className="btn-logout-small">
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-gaming" style={{ fontSize: '12px', padding: '8px 20px' }}>
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="categories-menu">
          <div className="categories-container">
            {categories.map((cat) => (
              <Link 
                key={cat._id} 
                to={`/product/category/${cat._id}`}
                className="category-item"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default Navbar;