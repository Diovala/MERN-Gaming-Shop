import React, { Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Wrapper để dùng useNavigate trong Class Component
function withNavigate(Component) {
  return function(props) {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  }
}

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      message: '',
      messageType: '' // 'success' hoặc 'error'
    };
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleRegister = async (e) => {
    e.preventDefault();
    const { fullName, email, password, phone, address } = this.state;

    try {
      const res = await axios.post('http://localhost:5000/api/customer/register', {
        fullName, email, password, phone, address
      });

      if (res.data.success) {
        this.setState({ 
          message: '✅ ' + res.data.message,
          messageType: 'success'
        });
        
        // Đợi 1.5 giây rồi chuyển sang trang Login
        setTimeout(() => {
          this.props.navigate('/login', { 
            state: { message: '✅ Đăng ký thành công! Vui lòng đăng nhập.' } 
          });
        }, 1500);
      }
    } catch (error) {
      this.setState({ 
        message: '❌ ' + (error.response?.data?.message || 'Đăng ký thất bại!'),
        messageType: 'error'
      });
    }
  }

  render() {
    const { message, messageType } = this.state;

    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', background: '#1a1a1a', border: '2px solid #333', borderRadius: '8px' }}>
        <h2 style={{ color: '#e60012', marginBottom: '25px', textAlign: 'center', fontSize: '28px', textTransform: 'uppercase' }}>
          🎮 ĐĂNG KÝ TÀI KHOẢN
        </h2>
        
        {message && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            background: messageType === 'success' ? '#1a3a2a' : '#3a1a1a',
            color: messageType === 'success' ? '#28a745' : '#ff6b6b',
            borderRadius: '4px',
            textAlign: 'center',
            border: `1px solid ${messageType === 'success' ? '#28a745' : '#dc3545'}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={this.handleRegister}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>Họ và tên *</label>
            <input 
              name="fullName" 
              placeholder="Nguyễn Văn A" 
              value={this.state.fullName} 
              onChange={this.handleInputChange} 
              required 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>Email *</label>
            <input 
              name="email" 
              type="email" 
              placeholder="email@example.com" 
              value={this.state.email} 
              onChange={this.handleInputChange} 
              required 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>Mật khẩu *</label>
            <input 
              name="password" 
              type="password" 
              placeholder="Tối thiểu 6 ký tự" 
              value={this.state.password} 
              onChange={this.handleInputChange} 
              required 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>Số điện thoại</label>
            <input 
              name="phone" 
              placeholder="09xxxxxxxx" 
              value={this.state.phone} 
              onChange={this.handleInputChange} 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>Địa chỉ</label>
            <textarea 
              name="address" 
              placeholder="Địa chỉ nhận hàng" 
              value={this.state.address} 
              onChange={this.handleInputChange} 
              rows="2" 
              style={{...inputStyle, resize:'vertical'}} 
            />
          </div>
          
          <button type="submit" className="btn-gaming" style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            ĐĂNG KÝ NGAY
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#e60012', fontWeight: 'bold' }}>Đăng nhập ngay</Link>
        </p>
      </div>
    );
  }
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  background: '#0a0a0a',
  border: '1px solid #333',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '15px'
};

export default withNavigate(Register);