require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Admin } = require('./models/Models');

const createAdmin = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Kiểm tra admin đã tồn tại chưa
    const exists = await Admin.findOne({ username: 'admin' });
    if (exists) {
      console.log('⚠️ Admin đã tồn tại. Xóa và tạo lại...');
      await Admin.deleteOne({ username: 'admin' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Hashed password:', hashedPassword);

    // Tạo admin
    await Admin.create({
      username: 'admin',
      email: 'admin@gamingshop.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true
    });

    console.log('✅ Tạo admin thành công!');
    console.log('📝 Login với: username="admin", password="admin123"');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

createAdmin();