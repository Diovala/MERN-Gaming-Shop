import React, { Component } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../contexts/MyProvider.jsx';

// ✅ Wrapper cung cấp cả Context và Hooks cho Class Component
function withLoginContext(Component) {
  return function WrappedLogin(props) {
    const navigate = useNavigate();
    const location = useLocation();
    
    return (
      <MyContext.Consumer>
        {(contextValue) => (
          <Component 
            {...props} 
            navigate={navigate} 
            location={location}
            context={contextValue}
          />
        )}
      </MyContext.Consumer>
    );
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      message: '',
      redirect: false
    };
  }

  componentDidMount() {
    // ✅ Lấy context từ props thay vì this.context
    const { context } = this.props;
    
    // ✅ Kiểm tra nếu đã login rồi thì về trang chủ
    if (context && context.token) {
      this.setState({ redirect: true });
      return;
    }

    // ✅ Hiển thị thông báo từ trang Register (nếu có)
    if (this.props.location?.state?.message) {
      this.setState({ message: this.props.location.state.message });
    }
  }

  handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    const { context, navigate } = this.props;

    try {
      const res = await axios.post('http://localhost:5000/api/customer/login', {
        email,
        password
      });

      if (res.data.success) {
        // ✅ 1. Lưu token và user vào Context
        if (context && context.login) {
          context.login(res.data.token, res.data.user);
        }
        
        // ✅ 2. Lưu vào localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // ✅ 3. QUAN TRỌNG: Báo cho Navbar biết đã login
        window.dispatchEvent(new Event('user-state-changed'));
        
        // ✅ 4. Chuyển về trang chủ
        navigate('/');
      }
    } catch (error) {
      this.setState({ 
        message: '❌ ' + (error.response?.data?.message || 'Đăng nhập thất bại!') 
      });
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to="/" replace />;
    }

    const { message } = this.state;

    return (
      <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', background: '#1a1a1a', border: '2px solid #333', borderRadius: '8px' }}>
        <h2 style={{ color: '#e60012', marginBottom: '25px', textAlign: 'center', fontSize: '28px', textTransform: 'uppercase' }}>
          🔐 ĐĂNG NHẬP
        </h2>
        
        {message && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            background: message.includes('✅') ? '#1a3a2a' : '#3a1a1a',
            color: message.includes('✅') ? '#28a745' : '#ff6b6b',
            borderRadius: '4px',
            textAlign: 'center',
            border: `1px solid ${message.includes('✅') ? '#28a745' : '#dc3545'}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={this.handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>Email</label>
            <input 
              type="email" 
              placeholder="nhap@email.com"
              value={this.state.email} 
              onChange={(e) => this.setState({ email: e.target.value })} 
              required 
              style={inputStyle} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#aaa', marginBottom: '5px', fontSize: '14px' }}>Mật khẩu</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={this.state.password} 
              onChange={(e) => this.setState({ password: e.target.value })} 
              required 
              style={inputStyle} 
            />
          </div>

          <button type="submit" className="btn-gaming" style={{ width: '100%', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            ĐĂNG NHẬP
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333' }}>
          <p style={{ color: '#aaa', marginBottom: '10px' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: '#e60012', fontWeight: 'bold' }}>Đăng ký ngay</Link>
          </p>
          <Link to="/" style={{ color: '#666', fontSize: '14px' }}>← Về trang chủ</Link>
        </div>
      </div>
    );
  }
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  background: '#0a0a0a',
  border: '1px solid #333',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '15px'
};

export default withLoginContext(Login);