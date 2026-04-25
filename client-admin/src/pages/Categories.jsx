import React, { Component } from 'react';
import axios from 'axios';
import { AdminContext } from '../contexts/AdminContext';

class Categories extends Component {
  static contextType = AdminContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      loading: true,
      showModal: false,
      editingId: null,
      formData: { name: '', slug: '' }
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories = async () => {
    const { token } = this.context;
    try {
      const res = await axios.get('http://localhost:5000/api/admin/categories', {
        headers: { 'x-access-token': token }
      });
      if (res.data.success) {
        this.setState({ categories: res.data.data || [], loading: false });
      }
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
      this.setState({ loading: false });
    }
  }

  openModal = (category = null) => {
    if (category) {
      this.setState({ 
        editingId: category._id, 
        formData: { name: category.name, slug: category.slug },
        showModal: true 
      });
    } else {
      this.setState({ 
        editingId: null, 
        formData: { name: '', slug: '' },
        showModal: true 
      });
    }
  }

  closeModal = () => {
    this.setState({ showModal: false, editingId: null, formData: { name: '', slug: '' } });
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: { ...prevState.formData, [name]: value }
    }));
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { token } = this.context;
    const { editingId, formData } = this.state;

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/admin/categories/${editingId}`, formData, {
          headers: { 'x-access-token': token }
        });
      } else {
        await axios.post('http://localhost:5000/api/admin/categories', formData, {
          headers: { 'x-access-token': token }
        });
      }
      this.closeModal();
      this.fetchCategories();
    } catch (error) {
      alert('Lỗi lưu danh mục!');
    }
  }

  handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    const { token } = this.context;
    try {
      await axios.delete(`http://localhost:5000/api/admin/categories/${id}`, {
        headers: { 'x-access-token': token }
      });
      this.fetchCategories();
    } catch (error) {
      alert('Lỗi xóa danh mục!');
    }
  }

  render() {
    const { categories, loading, showModal, formData } = this.state;

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#e60012' }}>📂 QUẢN LÝ DANH MỤC</h2>
          <button className="btn-gaming" onClick={() => this.openModal()}>+ Thêm danh mục</button>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="datatable">
            <thead>
              <tr>
                <th>Tên danh mục</th>
                <th>Slug</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(categories) && categories.map(cat => (
                <tr key={cat._id}>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>
                    <button className="btn" style={{ background: '#ffc107', marginRight: '5px' }} onClick={() => this.openModal(cat)}>Sửa</button>
                    <button className="btn btn-cancel" onClick={() => this.handleDelete(cat._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal Thêm/Sửa */}
        {showModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3>{this.state.editingId ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}</h3>
              <form onSubmit={this.handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Tên danh mục</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={this.handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>Slug (URL)</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={this.handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-gaming">💾 Lưu</button>
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
  width: '400px',
  border: '2px solid #e60012'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  background: '#0a0a0a',
  border: '1px solid #333',
  color: '#fff',
  borderRadius: '4px'
};

export default Categories;