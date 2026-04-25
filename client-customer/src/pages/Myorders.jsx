import React, { Component } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import { MyContext } from '../contexts/MyProvider.jsx';

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: null,
      loading: true,
      message: '',
      redirect: null
    };
  }

  componentDidMount() {
    const { token } = this.context;
    if (!token) {
      this.setState({ redirect: '/login' });
      return;
    }
    this.fetchOrders();
  }

  fetchOrders = async () => {
    const { token } = this.context;
    try {
      const res = await axios.get('http://localhost:5000/api/customer/orders/my-orders', {
        headers: { 'x-access-token': token }
      });
      if (res.data.success) {
        // ✅ Defensive: Đảm bảo orders là mảng
        const orders = Array.isArray(res.data.data) ? res.data.data : [];
        this.setState({ orders, loading: false });
      }
    } catch (error) {
      this.setState({ message: 'Lỗi tải đơn hàng!', loading: false });
    }
  }

  // ✅ Format trạng thái với màu sắc
  renderStatus = (status) => {
    const styles = {
      PENDING: { color: '#ffc107', background: 'rgba(255, 193, 7, 0.1)' },
      APPROVED: { color: '#28a745', background: 'rgba(40, 167, 69, 0.1)' },
      CANCELED: { color: '#dc3545', background: 'rgba(220, 53, 69, 0.1)' },
      DELIVERED: { color: '#17a2b8', background: 'rgba(23, 162, 184, 0.1)' }
    };
    const style = styles[status] || { color: '#666' };
    
    return (
      <span style={{ 
        padding: '4px 12px', 
        borderRadius: '20px', 
        fontSize: '12px', 
        fontWeight: '600',
        ...style 
      }}>
        {status}
      </span>
    );
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to={this.state.redirect} replace />;
    }

    const { orders, loading, message } = this.state;

    if (loading) return <div className="loading">Đang tải đơn hàng...</div>;

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#e60012', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
            📦 LỊCH SỬ ĐƠN HÀNG
          </h2>
          <Link to="/myprofile" className="btn-gaming" style={{ fontSize: '12px', padding: '8px 20px' }}>
            ← Về hồ sơ
          </Link>
        </div>

        {message && (
          <div style={{ 
            padding: '12px', 
            marginBottom: '20px', 
            background: '#3a1a1a',
            border: '1px solid #dc3545',
            color: '#ff6b6b',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* ✅ Defensive: Kiểm tra orders trước khi map */}
        {!orders || orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#666'
          }}>
            <p style={{ fontSize: '48px', marginBottom: '15px' }}>📭</p>
            <p><strong>Bạn chưa có đơn hàng nào.</strong></p>
            <Link to="/" className="btn-gaming" style={{ marginTop: '20px', display: 'inline-block' }}>
              MUA SẮM NGAY
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="datatable" style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              background: '#1a1a1a',
              border: '1px solid #333'
            }}>
              <thead>
                <tr style={{ background: '#222' }}>
                  <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'left' }}>Mã đơn</th>
                  <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'left' }}>Ngày đặt</th>
                  <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'left' }}>Sản phẩm</th>
                  <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'right' }}>Tổng tiền</th>
                  <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {/* ✅ Defensive: Kiểm tra Array.isArray */}
                {Array.isArray(orders) && orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '12px', border: '1px solid #333', fontFamily: 'monospace' }}>
                      #{order._id.slice(-8)}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #333', color: '#aaa' }}>
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #333' }}>
                      {/* ✅ Defensive: Kiểm tra items là mảng */}
                      {Array.isArray(order.items) && order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '5px', fontSize: '14px' }}>
                          • {item.name} × {item.quantity}
                        </div>
                      ))}
                      {Array.isArray(order.items) && order.items.length > 2 && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          + {order.items.length - 2} sản phẩm khác...
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'right', fontWeight: 'bold', color: '#e60012' }}>
                      {order.totalAmount?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center' }}>
                      {this.renderStatus(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default Myorders;