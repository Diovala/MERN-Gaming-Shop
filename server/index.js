require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./utils/db');
const customerRoutes = require('./api/customer');
const adminRoutes = require('./api/admin');

const app = express();
connectDB();

// Middleware cơ bản
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Hỗ trợ ảnh Base64
app.use(express.urlencoded({ extended: true }));

// Mount API Routes
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => res.json({ status: 'Server OK', theme: 'Gaming' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Lỗi hệ thống' : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));