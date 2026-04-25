import { useState, useContext } from 'react';
import axios from 'axios';
import { AdminContext } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', { username, password });
      if (res.data.success) {
        login(res.data.token);
        navigate('/admin'); // Chuyển vào trang quản trị
      }
    } catch (err) {
      alert('Sai thông tin đăng nhập Admin!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>
      <form onSubmit={handleLogin} style={{ background: '#1a1a1a', padding: '40px', borderRadius: '8px', width: '350px', border: '1px solid #e60012' }}>
        <h2 style={{ color: '#e60012', textAlign: 'center', marginBottom: '20px' }}>ADMIN LOGIN</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#333', border: 'none', color: 'white' }} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#333', border: 'none', color: 'white' }} required />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#e60012', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>ĐĂNG NHẬP</button>
      </form>
    </div>
  );
};

export default Login;