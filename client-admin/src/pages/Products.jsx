import React, { Component } from 'react';
import axios from 'axios';
import { AdminContext } from '../contexts/AdminContext';

class Products extends Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      categories: [],
      loading: true,
      showModal: false,
      editingId: null,
      formData: {
        name: '',
        price: '',
        discountPrice: '',
        brand: '',
        stock: '',
        category: '',
        images: [],
        specs: [{ k: '', v: '' }]
      }
    };
  }

  componentDidMount() {
    this.fetchProducts();
    this.fetchCategories();
  }

  fetchProducts = async () => {
    const { token } = this.context;
    try {
      const res = await axios.get('http://localhost:5000/api/admin/products', {
        headers: { 'x-access-token': token }
      });
      if (res.data.success) {
        this.setState({ products: res.data.data || [], loading: false });
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  }

  fetchCategories = async () => {
    const { token } = this.context;
    try {
      const res = await axios.get('http://localhost:5000/api/admin/categories', {
        headers: { 'x-access-token': token }
      });
      if (res.data.success) {
        this.setState({ categories: res.data.data || [] });
      }
    } catch (error) {
      console.error('Lỗi tải categories:', error);
    }
  }

  openModal = (product = null) => {
    if (product) {
      this.setState({
        editingId: product._id,
        formData: {
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice || '',
          brand: product.brand,
          stock: product.stock,
          category: product.category?._id || product.category,
          images: Array.isArray(product.images) ? product.images : [],
          specs: Array.isArray(product.specs) && product.specs.length > 0 ? product.specs : [{ k: '', v: '' }]
        },
        showModal: true
      });
    } else {
      this.setState({
        editingId: null,
        formData: {
          name: '', price: '', discountPrice: '', brand: '', stock: '', category: '',
          images: [], specs: [{ k: '', v: '' }]
        },
        showModal: true
      });
    }
  }

  closeModal = () => {
    this.setState({ showModal: false, editingId: null });
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: { ...prevState.formData, [name]: value }
    }));
  }

  handleImageUpload = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    const base64Promises = files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(base64Promises).then(images => {
      this.setState(prevState => ({
        formData: { ...prevState.formData, images }
      }));
    });
  }

  handleSpecChange = (index, field, value) => {
    const newSpecs = [...this.state.formData.specs];
    newSpecs[index][field] = value;
    this.setState(prevState => ({
      formData: { ...prevState.formData, specs: newSpecs }
    }));
  }

  addSpec = () => {
    this.setState(prevState => ({
      formData: { ...prevState.formData, specs: [...prevState.formData.specs, { k: '', v: '' }] }
    }));
  }

  removeSpec = (index) => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        specs: prevState.formData.specs.filter((_, i) => i !== index)
      }
    }));
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { token } = this.context;
    const { editingId, formData } = this.state;

    try {
      const url = editingId 
        ? `http://localhost:5000/api/admin/products/${editingId}`
        : 'http://localhost:5000/api/admin/products';
      
      const method = editingId ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { 'x-access-token': token }
      });

      this.closeModal();
      this.fetchProducts();
    } catch (error) {
      alert('Lỗi lưu sản phẩm: ' + (error.response?.data?.message || error.message));
    }
  }

  handleDelete = async (id) => {
    if (!window.confirm('Xóa sản phẩm này?')) return;
    const { token } = this.context;
    try {
      await axios.delete(`http://localhost:5000/api/admin/products/${id}`, {
        headers: { 'x-access-token': token }
      });
      this.fetchProducts();
    } catch (error) {
      alert('Lỗi xóa sản phẩm!');
    }
  }

  render() {
    const { products, categories, loading, showModal, formData } = this.state;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#e60012' }}>🛒 QUẢN LÝ SẢN PHẨM</h2>
          <button className="btn-gaming" onClick={() => this.openModal()}>+ Thêm sản phẩm</button>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="datatable">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.map(p => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.brand}</td>
                  <td style={{ color: '#e60012', fontWeight: 'bold' }}>{p.price?.toLocaleString('vi-VN')} ₫</td>
                  <td>{p.stock}</td>
                  <td>
                    <button className="btn" style={{ background: '#ffc107', marginRight: '5px' }} onClick={() => this.openModal(p)}>Sửa</button>
                    <button className="btn btn-cancel" onClick={() => this.handleDelete(p._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal Thêm/Sửa Sản phẩm */}
        {showModal && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContentStyle, width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
              <h3>{this.state.editingId ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</h3>
              
              <form onSubmit={this.handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={labelStyle}>Tên sản phẩm *</label>
                    <input name="name" value={formData.name} onChange={this.handleInputChange} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Thương hiệu *</label>
                    <input name="brand" value={formData.brand} onChange={this.handleInputChange} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Giá gốc *</label>
                    <input type="number" name="price" value={formData.price} onChange={this.handleInputChange} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Giá khuyến mãi</label>
                    <input type="number" name="discountPrice" value={formData.discountPrice} onChange={this.handleInputChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tồn kho *</label>
                    <input type="number" name="stock" value={formData.stock} onChange={this.handleInputChange} required style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Danh mục *</label>
                    <select name="category" value={formData.category} onChange={this.handleInputChange} required style={inputStyle}>
                      <option value="">-- Chọn danh mục --</option>
                      {Array.isArray(categories) && categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Upload ảnh */}
                <div style={{ marginTop: '15px' }}>
                  <label style={labelStyle}>🖼️ Ảnh sản phẩm (Max 4)</label>
                  <input type="file" multiple accept="image/*" onChange={this.handleImageUpload} style={{ color: '#fff' }} />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {Array.isArray(formData.images) && formData.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`img-${idx}`} style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #444' }} />
                    ))}
                  </div>
                </div>

                {/* Thông số động */}
                <div style={{ marginTop: '15px' }}>
                  <label style={labelStyle}>⚙️ Thông số kỹ thuật</label>
                  {Array.isArray(formData.specs) && formData.specs.map((spec, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                      <input placeholder="Tên (VD: CPU)" value={spec.k} onChange={e => this.handleSpecChange(idx, 'k', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <input placeholder="Giá trị (VD: Core i7)" value={spec.v} onChange={e => this.handleSpecChange(idx, 'v', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <button type="button" onClick={() => this.removeSpec(idx)} style={{ background: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer', padding: '0 10px' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={this.addSpec} style={{ marginTop: '8px', background: 'transparent', color: '#aaa', border: '1px dashed #444', padding: '5px 10px', cursor: 'pointer' }}>+ Thêm thông số</button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn-gaming">💾 Lưu sản phẩm</button>
                  <button type="button" className="btn" onClick={this.closeModal} style={{ background: '#333' }}>Hủy</button>
                </div>
              </form>
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
  border: '2px solid #e60012'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  background: '#0a0a0a',
  border: '1px solid #333',
  color: '#fff',
  borderRadius: '4px',
  marginTop: '5px'
};

const labelStyle = {
  display: 'block',
  color: '#aaa',
  marginBottom: '5px',
  fontSize: '14px'
};

export default Products;