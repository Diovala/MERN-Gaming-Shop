import React, { Component } from 'react';
import axios from 'axios';
import { AdminContext } from '../contexts/AdminContext';

class Orders extends Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      loading: true,
      selectedOrder: null
    };
  }

  componentDidMount() {
    this.fetchOrders();
  }

  fetchOrders = async () => {
    const { token } = this.context;
    try {
      const res = await axios.get('http://localhost:5000/api/admin/orders', {
        headers: { 'x-access-token': token }
      });
      if (res.data.success) {
        this.setState({ orders: res.data.data || [], loading: false });
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  updateStatus = async (orderId, status) => {
    if (!window.confirm(`Xác nhận chuyển đơn sang ${status}?`)) return;
    
    const { token } = this.context;
    try {
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, 
        { status }, 
        { headers: { 'x-access-token': token } }
      );
      this.fetchOrders();
    } catch (error) {
      alert('Lỗi cập nhật trạng thái!');
    }
  }

  openOrderDetail = (order) => {
    this.setState({ selectedOrder: order });
  }

  closeOrderDetail = () => {
    this.setState({ selectedOrder: null });
  }

  render() {
    const { orders, loading, selectedOrder } = this.state;

    return (
      <div>
        <h2 style={{ color: '#e60012', marginBottom: '20px' }}>📦 QUẢN LÝ ĐƠN HÀNG</h2>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="datatable">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) && orders.map(order => (
                <tr key={order._id}>
                  <td>
                    <button 
                      className="btn" 
                      style={{ background: 'transparent', color: '#17a2b8', padding: '5px 10px' }}
                      onClick={() => this.openOrderDetail(order)}
                    >
                      #{order._id?.slice(-8)}
                    </button>
                  </td>
                  <td>{order.customer?.fullName || 'N/A'}</td>
                  <td style={{ color: '#e60012', fontWeight: 'bold' }}>
                    {order.totalAmount?.toLocaleString('vi-VN')} ₫
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: order.status === 'PENDING' ? 'rgba(255, 193, 7, 0.1)' : 
                                order.status === 'APPROVED' ? 'rgba(40, 167, 69, 0.1)' : 
                                'rgba(220, 53, 69, 0.1)',
                      color: order.status === 'PENDING' ? '#ffc107' : 
                             order.status === 'APPROVED' ? '#28a745' : '#dc3545'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === 'PENDING' && (
                      <>
                        <button className="btn btn-approve" onClick={() => this.updateStatus(order._id, 'APPROVED')} style={{ marginRight: '5px' }}>Duyệt</button>
                        <button className="btn btn-cancel" onClick={() => this.updateStatus(order._id, 'CANCELED')}>Hủy</button>
                      </>
                    )}
                    {order.status !== 'PENDING' && <span style={{ color: '#666' }}>Đã xử lý</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal Chi tiết đơn hàng */}
        {selectedOrder && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, width: '700px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: '#e60012' }}>📦 CHI TIẾT ĐƠN HÀNG #{selectedOrder._id?.slice(-8)}</h3>
                <button onClick={this.closeOrderDetail} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
              </div>

              {/* Thông tin khách hàng */}
              <div style={{ background: '#0a0a0a', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
                <h4 style={{ color: '#aaa', marginBottom: '10px' }}>👤 Thông tin người mua</h4>
                <p><strong>Họ tên:</strong> {selectedOrder.customer?.fullName}</p>
                <p><strong>Email:</strong> {selectedOrder.customer?.email}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
              </div>

              {/* Danh sách sản phẩm */}
              <h4 style={{ color: '#aaa', marginBottom: '10px' }}>🛍️ Sản phẩm đã mua</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '15px', padding: '10px', background: '#0a0a0a', marginBottom: '10px', borderRadius: '4px' }}>
                    <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#fff' }}>{item.name}</div>
                      <div style={{ color: '#aaa', fontSize: '14px' }}>Số lượng: {item.quantity}</div>
                      <div style={{ color: '#e60012', fontWeight: 'bold' }}>{item.price?.toLocaleString('vi-VN')} ₫</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '2px solid #e60012', textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e60012' }}>
                  Tổng tiền: {selectedOrder.totalAmount?.toLocaleString('vi-VN')} ₫
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#1a1a1a',
  padding: '30px',
  borderRadius: '8px',
  border: '2px solid #e60012',
  maxHeight: '90vh',
  overflowY: 'auto'
};

export default Orders;