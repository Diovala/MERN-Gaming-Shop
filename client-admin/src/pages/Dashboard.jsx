import React, { Component } from 'react';
import { Link, Outlet, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AdminContext } from '../contexts/AdminContext';

class Dashboard extends Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props);
    this.state = {
      stats: {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0
      },
      loading: true
    };
  }

  componentDidMount() {
    if (this.context.token) {
      this.fetchStats();
    }
  }

  fetchStats = async () => {
    const { token } = this.context;
    try {
      // Gọi các API thống kê
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/orders', { headers: { 'x-access-token': token } }),
        axios.get('http://localhost:5000/api/admin/customers', { headers: { 'x-access-token': token } }),
        axios.get('http://localhost:5000/api/admin/products', { headers: { 'x-access-token': token } })
      ]);

      const orders = ordersRes.data.data || [];
      const customers = customersRes.data.data || [];
      const products = productsRes.data.data || [];

      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      this.setState({
        stats: {
          totalRevenue,
          totalOrders: orders.length,
          totalCustomers: customers.length,
          totalProducts: products.length
        },
        loading: false
      });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
      this.setState({ loading: false });
    }
  }

  handleLogout = () => {
    this.context.logout();
    window.location.href = '/';
  }

  render() {
    if (!this.context.token) {
      return <Navigate to="/" replace />;
    }

    const { stats, loading } = this.state;

    return (
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <h2 style={{ color: '#e60012', marginBottom: '30px', fontSize: '24px' }}>🎮 ADMIN PANEL</h2>
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/admin/dashboard" style={sidebarLinkStyle}>
                📊 Thống kê
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/admin/orders" style={sidebarLinkStyle}>
                📦 Quản lý Đơn hàng
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/admin/products" style={sidebarLinkStyle}>
                🛒 Quản lý Sản phẩm
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/admin/categories" style={sidebarLinkStyle}>
                📂 Quản lý Danh mục
              </Link>
            </li>
            <li style={{ marginBottom: '10px' }}>
              <Link to="/admin/customers" style={sidebarLinkStyle}>
                👥 Quản lý Khách hàng
              </Link>
            </li>
          </ul>

          <button onClick={this.handleLogout} className="btn btn-logout">
            🚪 Đăng xuất Admin
          </button>
        </div>

        {/* Main Content */}
        <div className="content">
          {/* Hiển thị Stats nếu ở trang dashboard */}
          {window.location.pathname === '/admin/dashboard' && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ color: '#fff', marginBottom: '20px' }}>📊 TỔNG QUAN HỆ THỐNG</h2>
              
              {loading ? (
                <div className="loading">Đang tải thống kê...</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  <StatCard 
                    title="💰 Doanh thu" 
                    value={`${stats.totalRevenue.toLocaleString('vi-VN')} ₫`} 
                    color="#28a745" 
                  />
                  <StatCard 
                    title="📦 Đơn hàng" 
                    value={stats.totalOrders} 
                    color="#ffc107" 
                  />
                  <StatCard 
                    title="👥 Khách hàng" 
                    value={stats.totalCustomers} 
                    color="#17a2b8" 
                  />
                  <StatCard 
                    title="🛍️ Sản phẩm" 
                    value={stats.totalProducts} 
                    color="#e60012" 
                  />
                </div>
              )}
            </div>
          )}

          <Outlet />
        </div>
      </div>
    );
  }
}

// Component StatCard
const StatCard = ({ title, value, color }) => (
  <div style={{
    background: '#1a1a1a',
    padding: '25px',
    borderRadius: '8px',
    border: `2px solid ${color}`,
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>{title}</div>
    <div style={{ fontSize: '32px', fontWeight: 'bold', color: color }}>{value}</div>
  </div>
);

const sidebarLinkStyle = {
  display: 'block',
  padding: '12px 15px',
  color: '#aaa',
  textDecoration: 'none',
  borderRadius: '4px',
  transition: 'all 0.3s'
};

export default Dashboard;