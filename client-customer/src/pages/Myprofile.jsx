import React, { Component } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { MyContext } from "../contexts/MyProvider.jsx";

// ✅ Wrapper cung cấp Context cho Class Component
function withMyprofileContext(Component) {
  return function WrappedMyprofile(props) {
    const navigate = useNavigate();

    return (
      <MyContext.Consumer>
        {(contextValue) => (
          <Component {...props} navigate={navigate} context={contextValue} />
        )}
      </MyContext.Consumer>
    );
  };
}

class Myprofile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "info",
      customer: null,
      loading: true,
      isEditing: false,
      fullName: "",
      phone: "",
      address: "",
      newPassword: "",
      confirmNewPassword: "",
      message: "",
      redirect: null,
    };
  }

  componentDidMount() {
    const { context } = this.props;
    const token = context?.token || localStorage.getItem("token");

    if (!token) {
      this.setState({ redirect: "/login" });
      return;
    }
    this.fetchProfile();
  }

fetchProfile = async () => {
  const { context } = this.props;
  const token = context?.token || localStorage.getItem('token');
  
  if (!token) {
    console.warn('No token found');
    this.setState({ loading: false });
    return;
  }

  try {
    console.log('Fetching profile with token:', token);
    const res = await axios.get('http://localhost:5000/api/customer/profile', {
      headers: { 'x-access-token': token }
    });
    
    console.log('Profile response:', res.data); // ✅ Debug log
    
    if (res.data.success && res.data.data) {
      const c = res.data.data;
      this.setState({
        customer: c,
        fullName: c.fullName || '',
        phone: c.phone || '',
        address: c.address || '',
        loading: false
      });
    } else {
      console.error('API response not successful or no data');
      this.setState({ loading: false });
    }
  } catch (error) {
    console.error('Lỗi tải profile:', error);
    console.error('Error response:', error.response?.data);
    this.setState({ loading: false });
  }
}

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  toggleEdit = () => {
    if (this.state.isEditing && this.state.customer) {
      this.setState({
        isEditing: false,
        fullName: this.state.customer.fullName,
        phone: this.state.customer.phone || "",
        address: this.state.customer.address || "",
        newPassword: "",
        confirmNewPassword: "",
        message: "",
      });
    } else {
      this.setState({ isEditing: !this.state.isEditing, message: "" });
    }
  };

  handleSave = async () => {
    const { context } = this.props;

    if (this.state.newPassword !== this.state.confirmNewPassword) {
      return this.setState({ message: "Mật khẩu xác nhận không khớp!" });
    }

    try {
      const res = await axios.put(
        "http://localhost:5000/api/customer/profile",
        {
          fullName: this.state.fullName,
          phone: this.state.phone,
          address: this.state.address,
          newPassword: this.state.newPassword || undefined,
        },
        {
          headers: { "x-access-token": context.token },
        },
      );

      if (res.data.success) {
        if (context.login) {
          context.login(context.token, {
            ...context.user,
            fullName: this.state.fullName,
          });
        }
        this.setState({
          isEditing: false,
          message: "✅ Cập nhật thành công!",
          newPassword: "",
          confirmNewPassword: "",
        });
        this.fetchProfile();
      }
    } catch (error) {
      this.setState({
        message: "❌ " + (error.response?.data?.message || "Lỗi hệ thống"),
      });
    }
  };

  renderSidebar = () => {
    const { activeTab } = this.state;
    return (
      <div
        style={{
          width: "250px",
          background: "#1a1a1a",
          padding: "20px",
          height: "fit-content",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "20px",
            borderBottom: "1px solid #333",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
            }}
          >
            👤
          </div>
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {this.props.context?.user?.fullName || "User"}
          </div>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            { id: "info", icon: "👤", text: "Thông tin tài khoản" },
            { id: "orders", icon: "📦", text: "Quản lý đơn hàng" },
          ].map((item) => (
            <li
              key={item.id}
              onClick={() => this.setState({ activeTab: item.id, message: "" })}
              style={{
                padding: "12px 15px",
                cursor: "pointer",
                color: activeTab === item.id ? "#e60012" : "#aaa",
                background: activeTab === item.id ? "#222" : "transparent",
                fontWeight: activeTab === item.id ? "bold" : "normal",
                marginBottom: "5px",
                transition: "all 0.2s",
              }}
            >
              {item.icon} {item.text}
            </li>
          ))}
          <li
            onClick={() => {
              this.props.context.logout();
              window.location.href = "/";
            }}
            style={{
              padding: "12px 15px",
              cursor: "pointer",
              color: "#666",
              marginTop: "20px",
            }}
          >
            🚪 Đăng xuất
          </li>
        </ul>
      </div>
    );
  };

  renderProfileInfo = () => {
    const {
      isEditing,
      fullName,
      phone,
      address,
      newPassword,
      confirmNewPassword,
      message,
    } = this.state;
    const { customer } = this.state; // ✅ Lấy customer từ state

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              color: "#fff",
              borderBottom: "2px solid #e60012",
              paddingBottom: "10px",
            }}
          >
            Thông tin tài khoản
          </h2>
          {!isEditing && (
            <button
              onClick={this.toggleEdit}
              className="btn-gaming"
              style={{ fontSize: "12px", padding: "5px 15px" }}
            >
              ✏️ CHỈNH SỬA
            </button>
          )}
        </div>

        {message && (
          <div
            style={{
              padding: "10px",
              marginBottom: "15px",
              background: message.includes("✅") ? "#1a3a2a" : "#3a1a1a",
              color: message.includes("✅") ? "#28a745" : "#ff6b6b",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            background: "#1a1a1a",
            padding: "25px",
            border: "1px solid #333",
          }}
        >
          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                color: "#888",
                fontSize: "14px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Email (Không thể thay đổi)
            </label>
            <div
              style={{
                padding: "12px",
                background: "#0a0a0a",
                border: "1px solid #333",
                color: "#aaa",
                borderRadius: "4px",
              }}
            >
              {this.props.context?.user?.email || "Không có"}
            </div>
          </div>

          {/* Họ tên */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                color: "#888",
                fontSize: "14px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Họ tên
            </label>
            {isEditing ? (
              <input
                name="fullName"
                value={fullName}
                onChange={this.handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0a0a0a",
                  border: "1px solid #e60012",
                  color: "#fff",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <div
                style={{
                  padding: "12px",
                  background: "transparent",
                  borderBottom: "1px solid #333",
                  color: fullName ? "#fff" : "#666",
                }}
              >
                {fullName || "Chưa cập nhật"}
              </div>
            )}
          </div>

          {/* Số điện thoại */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                color: "#888",
                fontSize: "14px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Số điện thoại
            </label>
            {isEditing ? (
              <input
                name="phone"
                value={phone}
                onChange={this.handleInputChange}
                placeholder="09xxxxxxxx"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0a0a0a",
                  border: "1px solid #e60012",
                  color: "#fff",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <div
                style={{
                  padding: "12px",
                  background: "transparent",
                  borderBottom: "1px solid #333",
                  color: phone ? "#fff" : "#666",
                }}
              >
                {phone || "Chưa cập nhật"}
              </div>
            )}
          </div>

          {/* Địa chỉ */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                color: "#888",
                fontSize: "14px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Địa chỉ
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={address}
                onChange={this.handleInputChange}
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0a0a0a",
                  border: "1px solid #e60012",
                  color: "#fff",
                  borderRadius: "4px",
                  resize: "vertical",
                }}
              />
            ) : (
              <div
                style={{
                  padding: "12px",
                  background: "transparent",
                  borderBottom: "1px solid #333",
                  color: address ? "#fff" : "#666",
                }}
              >
                {address || "Chưa cập nhật"}
              </div>
            )}
          </div>

          {/* Đổi mật khẩu (chỉ hiện khi edit) */}
          {isEditing && (
            <div
              style={{
                marginTop: "30px",
                paddingTop: "20px",
                borderTop: "1px dashed #444",
              }}
            >
              <label
                style={{
                  color: "#e60012",
                  fontSize: "14px",
                  display: "block",
                  marginBottom: "15px",
                }}
              >
                🔐 Đổi mật khẩu (để trống nếu không đổi)
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={this.handleInputChange}
                  style={{
                    padding: "12px",
                    background: "#0a0a0a",
                    border: "1px solid #333",
                    color: "#fff",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmNewPassword}
                  onChange={this.handleInputChange}
                  style={{
                    padding: "12px",
                    background: "#0a0a0a",
                    border: "1px solid #333",
                    color: "#fff",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>
          )}

          {/* Nút hành động */}
          {isEditing && (
            <div style={{ marginTop: "25px", display: "flex", gap: "10px" }}>
              <button
                onClick={this.handleSave}
                className="btn-gaming"
                style={{ flex: 1 }}
              >
                💾 LƯU THÔNG TIN
              </button>
              <button
                onClick={this.toggleEdit}
                className="btn-gaming"
                style={{ flex: 1, background: "#333", borderColor: "#555" }}
              >
                HỦY
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { redirect, activeTab, loading } = this.state;

    if (redirect) {
      return <Navigate to={redirect} replace />;
    }

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "30px 0",
          alignItems: "flex-start",
        }}
      >
        {this.renderSidebar()}
        <div style={{ flex: 1 }}>
          {activeTab === "info" ? (
            this.renderProfileInfo()
          ) : (
            <OrderHistoryTable context={this.props.context} />
          )}
        </div>
      </div>
    );
  }
}

// Component con hiển thị lịch sử đơn hàng
const OrderHistoryTable = ({ context }) => {
  // ✅ Nhận context trực tiếp từ props
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // ✅ Phòng thủ: Kiểm tra token tồn tại
    const token = context?.token;
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/customer/orders/my-orders",
          {
            headers: { "x-access-token": token },
          },
        );
        if (res.data.success) {
          setOrders(res.data.data || []);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [context?.token]); // ✅ Dependency array an toàn

  if (loading) return <div>Đang tải đơn hàng...</div>;

  return (
    <div>
      <h2
        style={{
          color: "#fff",
          borderBottom: "2px solid #e60012",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        Lịch sử đơn hàng
      </h2>
      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          Bạn chưa có đơn hàng nào.
        </div>
      ) : (
        <table
          className="datatable"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#1a1a1a",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>Mã đơn</th>
              <th style={thStyle}>Ngày đặt</th>
              <th style={thStyle}>Sản phẩm</th>
              <th style={thStyle}>Tổng tiền</th>
              <th style={thStyle}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td style={tdStyle}>#{o._id.slice(-8)}</td>
                <td style={tdStyle}>
                  {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td style={tdStyle}>
                  {o.items?.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                </td>
                <td
                  style={{ ...tdStyle, color: "#e60012", fontWeight: "bold" }}
                >
                  {o.totalAmount?.toLocaleString("vi-VN")} ₫
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      color:
                        o.status === "PENDING"
                          ? "#ffc107"
                          : o.status === "APPROVED"
                            ? "#28a745"
                            : "#dc3545",
                      fontWeight: "bold",
                    }}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #333",
  color: "#888",
  fontWeight: "normal",
};
const tdStyle = { padding: "12px", borderBottom: "1px solid #222" };

export default withMyprofileContext(Myprofile);
