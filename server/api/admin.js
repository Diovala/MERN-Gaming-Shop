const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models/Models');
const { ProductDAO, CategoryDAO, OrderDAO, CustomerDAO } = require('../models/DAO');
const { verifyToken, isAdmin } = require('../utils/jwt');
const { sendEmail } = require('../utils/EmailUtil');

// ==================== ADMIN AUTH ====================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu username hoặc password.' });
    }

    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) return res.status(401).json({ success: false, message: 'Sai thông tin đăng nhập.' });
    if (!admin.isActive) return res.status(403).json({ success: false, message: 'Tài khoản admin đã bị khóa.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Sai thông tin đăng nhập.' });

    const token = jwt.sign(
      { id: admin._id, role: 'ADMIN', username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email, role: 'ADMIN' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CATEGORY MANAGEMENT ====================
router.get('/categories', verifyToken, isAdmin, async (req, res) => {
  try {
    const categories = await CategoryDAO.getAllActive();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/categories', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, slug, image } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Thiếu name hoặc slug.' });
    }

    const category = await CategoryDAO.create({ name, slug, image: image || '' });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const category = await CategoryDAO.update(req.params.id, req.body);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const category = await CategoryDAO.delete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    
    res.json({ success: true, message: 'Xóa danh mục thành công (soft delete).' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PRODUCT MANAGEMENT ====================
router.get('/products', verifyToken, isAdmin, async (req, res) => {
  try {
    const products = await ProductDAO.getAllActive();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/products', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, price, discountPrice, brand, stock, category, images, specs } = req.body;

    // Validation phòng thủ
    if (!name || !price || !brand || !category) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }

    // Xử lý images: đảm bảo là mảng và max 4
    const processedImages = Array.isArray(images) ? images.slice(0, 4) : [];
    
    // Xử lý specs: đảm bảo là mảng các object {k, v}
    const processedSpecs = Array.isArray(specs) 
      ? specs.filter(s => s.k && s.v).map(s => ({ k: String(s.k).trim(), v: String(s.v).trim() }))
      : [];

    const product = await ProductDAO.create({
      name,
      price: Number(price),
      discountPrice: Number(discountPrice) || 0,
      brand,
      stock: Number(stock) || 0,
      category,
      images: processedImages,
      specs: processedSpecs
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/products/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { images, specs, ...otherData } = req.body;
    const updateData = { ...otherData };

    if (images) {
      updateData.images = Array.isArray(images) ? images.slice(0, 4) : [];
    }
    if (specs) {
      updateData.specs = Array.isArray(specs)
        ? specs.filter(s => s.k && s.v).map(s => ({ k: String(s.k).trim(), v: String(s.v).trim() }))
        : [];
    }

    const product = await ProductDAO.update(req.params.id, updateData);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/products/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await ProductDAO.delete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });

    res.json({ success: true, message: 'Xóa sản phẩm thành công (soft delete).' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDER MANAGEMENT ====================
router.get('/orders', verifyToken, isAdmin, async (req, res) => {
  try {
    const orders = await OrderDAO.getAll();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'CANCELED', 'DELIVERED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    }

    const order = await OrderDAO.updateStatus(req.params.id, status);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng.' });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CUSTOMER MANAGEMENT ====================
router.get('/customers', verifyToken, isAdmin, async (req, res) => {
  try {
    const customers = await CustomerDAO.getAll();
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/customers/:id/toggle-active', verifyToken, isAdmin, async (req, res) => {
  try {
    const customer = await CustomerDAO.toggleActive(req.params.id);
    res.json({ 
      success: true, 
      message: customer.isActive ? 'Mở khóa tài khoản thành công.' : 'Khóa tài khoản thành công.',
      data: { id: customer._id, isActive: customer.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== EMAIL MANAGEMENT ====================
router.post('/customers/send-email', verifyToken, isAdmin, async (req, res) => {
  try {
    const { to, subject, content } = req.body;

    // Defensive: Kiểm tra dữ liệu đầu vào
    if (!to || !subject || !content) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin email, tiêu đề hoặc nội dung.' });
    }

    // Kiểm tra format email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ success: false, message: 'Email không hợp lệ.' });
    }

    // Gửi email
    const isSent = await sendEmail(to, subject, content);

    if (isSent) {
      res.json({ success: true, message: 'Đã gửi email thành công.' });
    } else {
      res.status(500).json({ success: false, message: 'Gửi email thất bại. Vui lòng kiểm tra cấu hình server.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;