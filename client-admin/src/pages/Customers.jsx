import React, { Component } from "react";
import axios from "axios";
import { AdminContext } from "../contexts/AdminContext";

class Customers extends Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      loading: true,

      // State cho Modal Email
      showEmailModal: false,
      emailTarget: { email: "", name: "" },
      emailSubject: "",
      emailContent: "",
      isSending: false,
    };
  }

  componentDidMount() {
    this.fetchCustomers();
  }

  fetchCustomers = async () => {
    const { token } = this.context;
    try {
      const res = await axios.get("http://localhost:5000/api/admin/customers", {
        headers: { "x-access-token": token },
      });
      if (res.data.success) {
        this.setState({ customers: res.data.data || [], loading: false });
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  toggleActive = async (id) => {
    const { token } = this.context;
    try {
      await axios.put(
        `http://localhost:5000/api/admin/customers/${id}/toggle-active`,
        {},
        {
          headers: { "x-access-token": token },
        }
      );
      this.fetchCustomers();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  // Mở Modal Gửi Mail
  openEmailModal = (customer) => {
    this.setState({
      showEmailModal: true,
      emailTarget: { email: customer.email, name: customer.fullName },
      emailSubject: `Thông báo từ GAMING SHOP .VN`,
      emailContent: `Chào ${customer.fullName},\n\n`,
    });
  };

  // Đóng Modal
  closeEmailModal = () => {
    this.setState({ showEmailModal: false, isSending: false });
  };

  // Xử lý gửi mail
  handleSendEmail = async (e) => {
    e.preventDefault();
    this.setState({ isSending: true });

    const { token } = this.context;
    const { emailTarget, emailSubject, emailContent } = this.state;

    try {
      // Chuyển đổi newline thành thẻ <br> để hiển thị đẹp trong email
      const formattedContent = emailContent.replace(/\n/g, "<br>");

      await axios.post(
        "http://localhost:5000/api/admin/customers/send-email",
        {
          to: emailTarget.email,
          subject: emailSubject,
          content: `<div style="font-family: Arial, sans-serif;">${formattedContent}<br><br>Trân trọng,<br>GAMING SHOP .VN Team</div>`,
        },
        {
          headers: { "x-access-token": token },
        }
      );

      alert("✅ Gửi email thành công!");
      this.closeEmailModal();
    } catch (error) {
      alert(
        "❌ Lỗi gửi email: " + (error.response?.data?.message || error.message)
      );
    } finally {
      this.setState({ isSending: false });
    }
  };

  resendEmail = async (id, email) => {
    const { token } = this.context;
    try {
      await axios.get(
        `http://localhost:5000/api/admin/customers/resend-email/${id}`,
        {
          headers: { "x-access-token": token },
        }
      );
      alert(`Đã gửi lại email kích hoạt cho ${email}`);
    } catch (error) {
      alert("Lỗi gửi email!");
    }
  };

  render() {
    const { customers, loading, showEmailModal, emailSubject, emailContent, isSending } = this.state;

    return (
      <div>
        <h2 style={{ color: "#e60012", marginBottom: "20px" }}>
          👥 QUẢN LÝ KHÁCH HÀNG
        </h2>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="datatable">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(customers) &&
                customers.map((cust) => (
                  <tr key={cust._id}>
                    <td>{cust.fullName}</td>
                    <td>{cust.email}</td>
                    <td>{cust.phone || "Chưa cập nhật"}</td>
                    <td>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: cust.isActive
                            ? "rgba(40, 167, 69, 0.1)"
                            : "rgba(220, 53, 69, 0.1)",
                          color: cust.isActive ? "#28a745" : "#dc3545",
                        }}
                      >
                        {cust.isActive ? "✅ Active" : "❌ Locked"}
                      </span>
                    </td>
                    <td>
                      {/* Nút Khóa/Mở khóa */}
                      <button
                        className="btn"
                        style={{
                          background: cust.isActive ? "#ffc107" : "#28a745",
                          marginRight: "5px",
                        }}
                        onClick={() => this.toggleActive(cust._id)}
                      >
                        {cust.isActive ? "🔒 Khóa" : "🔓 Mở khóa"}
                      </button>
                      
                      {/* Nút Gửi Mail kích hoạt (nếu chưa active) */}
                      {!cust.isActivated && (
                        <button
                          className="btn"
                          style={{ background: "#17a2b8", marginRight: '5px' }}
                          onClick={() => this.resendEmail(cust._id, cust.email)}
                        >
                          📧 Kích hoạt
                        </button>
                      )}

                      {/* Nút Gửi Mail thông báo (Mới) */}
                      <button
                        className="btn"
                        style={{ background: "#e60012" }}
                        onClick={() => this.openEmailModal(cust)}
                      >
                        💌 Thông báo
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* ==================== MODAL GỬI EMAIL (NẰM NGOÀI BẢNG) ==================== */}
        {showEmailModal && (
          <div style={modalStyle}>
            <div style={modalContentStyle}>
              <h3 style={{ color: "#e60012", marginBottom: "20px" }}>
                📧 Gửi Email cho: {this.state.emailTarget.name}
              </h3>

              <form onSubmit={this.handleSendEmail}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ color: "#aaa" }}>Người nhận</label>
                  <input
                    type="email"
                    value={this.state.emailTarget.email}
                    disabled
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ color: "#aaa" }}>Tiêu đề</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) =>
                      this.setState({ emailSubject: e.target.value })
                    }
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ color: "#aaa" }}>Nội dung</label>
                  <textarea
                    rows="6"
                    value={emailContent}
                    onChange={(e) =>
                      this.setState({ emailContent: e.target.value })
                    }
                    required
                    style={{ ...inputStyle, resize: "vertical" }}
                  ></textarea>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    className="btn-gaming"
                    disabled={isSending}
                  >
                    {isSending ? "Đang gửi..." : "GỬI THÔNG BÁO"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={this.closeEmailModal}
                    style={{ background: "#333" }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Style cho Modal
const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "#1a1a1a",
  padding: "30px",
  borderRadius: "8px",
  width: "500px",
  border: "2px solid #e60012",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  background: "#0a0a0a",
  border: "1px solid #333",
  color: "#fff",
  borderRadius: "4px",
  marginTop: "5px",
};

export default Customers;