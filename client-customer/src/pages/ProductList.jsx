import React, { Component } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function withRouter(Component) {
  return function (props) {
    const params = useParams();
    const navigate = useNavigate();
    return <Component {...props} params={params} navigate={navigate} />;
  };
}

class ProductList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      loading: true,
      message: "",
      pageTitle: "",
    };
  }

  componentDidMount() {
    const { cid, keyword } = this.props.params;

    if (cid) {
      this.fetchByCategory(cid);
    } else if (keyword) {
      this.fetchBySearch(keyword);
    }
  }

  componentDidUpdate(prevProps) {
    // Lấy id danh mục mới và cũ
    const { cid, keyword } = this.props.params;
    const { cid: prevCid, keyword: prevKeyword } = prevProps.params;

    // Nếu id danh mục thay đổi HOẶC từ khóa tìm kiếm thay đổi -> Tải lại data
    if (cid !== prevCid || keyword !== prevKeyword) {
      if (cid) {
        this.fetchByCategory(cid);
      } else if (keyword) {
        this.fetchBySearch(keyword);
      }
    }
  }

  fetchByCategory = async (categoryId) => {
    this.setState({ loading: true });
    try {
      const res = await axios.get(
        `http://localhost:5000/api/customer/products/category/${categoryId}`,
      );
      if (res.data.success) {
        const categoryName = res.data.data[0]?.category?.name || "Danh mục";
        this.setState({
          products: res.data.data,
          pageTitle: `📦 ${categoryName}`,
          loading: false,
          message: "",
        });
      }
    } catch (error) {
      this.setState({
        message: "Lỗi tải sản phẩm!",
        loading: false,
      });
    }
  };

  fetchBySearch = async (keyword) => {
    this.setState({ loading: true });
    try {
      const res = await axios.get(
        `http://localhost:5000/api/customer/products/search/${keyword}`,
      );
      if (res.data.success) {
        this.setState({
          products: res.data.data,
          pageTitle: `🔍 Kết quả tìm kiếm: "${keyword}"`,
          loading: false,
          message: "",
        });
      }
    } catch (error) {
      this.setState({
        message: "Lỗi tìm kiếm!",
        loading: false,
      });
    }
  };

  render() {
    const { products, loading, message, pageTitle } = this.state;

    if (loading) {
      return <div className="loading">Đang tải sản phẩm...</div>;
    }

    if (message) {
      return (
        <div className="loading" style={{ color: "#e60012" }}>
          {message}
        </div>
      );
    }

    return (
      <div style={{ minHeight: "60vh", marginBottom: "40px" }}>
        <h2
          style={{
            fontSize: "28px",
            marginBottom: "30px",
            color: "#e60012",
            borderBottom: "2px solid #333",
            paddingBottom: "10px",
          }}
        >
          {pageTitle}
        </h2>

        {products.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#666",
              fontSize: "16px",
            }}
          >
            <p style={{ fontSize: "48px", marginBottom: "15px" }}>😕</p>
            <p>
              <strong>Rất tiếc, không tìm thấy sản phẩm nào phù hợp!</strong>
            </p>
            <p style={{ marginTop: "10px", fontSize: "14px" }}>
              Hãy thử từ khóa khác hoặc chọn danh mục khác.
            </p>
            <Link
              to="/"
              className="btn-gaming"
              style={{ marginTop: "20px", display: "inline-block" }}
            >
              Về trang chủ
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => {
              const hasDiscount = p.discountPrice > 0;
              const displayPrice = hasDiscount ? p.discountPrice : p.price;

              return (
                <div key={p._id} className="product-card">
                  {hasDiscount && <div className="product-badge">SALE</div>}

                  <div className="product-image">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} />
                    ) : (
                      <div style={{ color: "#444", fontSize: "48px" }}>🖥️</div>
                    )}
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{p.name}</h3>

                    <div className="product-price">
                      {displayPrice.toLocaleString("vi-VN")} ₫
                      {hasDiscount && (
                        <span className="product-old-price">
                          {p.price.toLocaleString("vi-VN")} ₫
                        </span>
                      )}
                    </div>

                    {/* ✅ Link chi tiết sản phẩm */}
                    <Link to={`/product/${p._id}`} className="btn-view-detail">
                      XEM CHI TIẾT
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ProductList);
