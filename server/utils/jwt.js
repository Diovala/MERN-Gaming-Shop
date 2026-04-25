const jwt = require('jsonwebtoken');
const { Admin, Customer } = require('../models/Models');

// Middleware xác thực Token qua Header: x-access-token
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ success: false, message: 'Thiếu token xác thực.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = decoded.role === 'ADMIN' ? Admin : Customer;

    // Lấy user mới nhất từ DB (tránh dùng cache token cũ nếu user bị khóa)
    const user = await Model.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Token không hợp lệ.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa.' });

    req.user = user; // Gắn vào request để dùng ở route phía sau
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token đã hết hạn.' });
    return res.status(401).json({ success: false, message: 'Xác thực thất bại.' });
  }
};

// Middleware check quyền Admin
exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập.' });
  }
  next();
};