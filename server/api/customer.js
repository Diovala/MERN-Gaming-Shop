const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Customer } = require("../models/Models");
const { ProductDAO, OrderDAO } = require("../models/DAO");
const transporter = require("../utils/mailer");
const { verifyToken } = require("../utils/jwt");
const { sendEmail } = require("../utils/EmailUtil");

// ==================== AUTH ====================
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, phone, address } = req.body;
    if (!fullName || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin bắt buộc." });

    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString("hex");

    await Customer.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      activationToken,
      activationTokenExpiry: Date.now() + 3600000,
    });

    const activationUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/activate?token=${activationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Kích hoạt tài khoản - Gaming Store",
      html: `<h3>Chào ${fullName},</h3><p>Nhấn link để kích hoạt:</p><a href="${activationUrl}">${activationUrl}</a>`,
    });

    res
      .status(201)
      .json({ success: true, message: "Đăng ký thành công! Kiểm tra email." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/activate", async (req, res) => {
  try {
    const { token } = req.query || req.body;
    if (!token)
      return res.status(400).json({ success: false, message: "Thiếu token." });

    const customer = await Customer.findOne({
      activationToken: token,
      activationTokenExpiry: { $gt: Date.now() },
    });
    if (!customer)
      return res
        .status(400)
        .json({ success: false, message: "Token không hợp lệ hoặc hết hạn." });

    customer.isActivated = true;
    customer.activationToken = undefined;
    customer.activationTokenExpiry = undefined;
    await customer.save();

    res.json({ success: true, message: "Kích hoạt thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Nhập email và mật khẩu." });

    const customer = await Customer.findOne({
      email: email.toLowerCase(),
    }).select("+password");
    if (!customer)
      return res
        .status(401)
        .json({ success: false, message: "Sai thông tin." });
    if (!customer.isActivated)
      return res
        .status(403)
        .json({ success: false, message: "Tài khoản chưa kích hoạt." });
    if (!customer.isActive)
      return res
        .status(403)
        .json({ success: false, message: "Tài khoản bị khóa." });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Sai thông tin." });

    const token = jwt.sign(
      { id: customer._id, role: "CUSTOMER" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({
      success: true,
      token,
      user: {
        id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PRODUCTS (Customer) ====================
router.get("/products", async (req, res) => {
  try {
    const { category } = req.query;
    let products = await ProductDAO.getAllActive();

    // Lọc theo category nếu có
    if (category) {
      products = products.filter(
        (p) =>
          (p.category._id && p.category._id.toString() === category) ||
          (p.category.toString && p.category.toString() === category),
      );
    }
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await ProductDAO.getById(req.params.id);
    if (!product || !product.isActive)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm." });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDERS (Checkout & History) ====================
router.post("/orders", verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = "COD" } = req.body;

    // Defensive: Kiểm tra cart
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống." });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Kiểm tra tồn kho và tính tổng tiền
    for (const item of items) {
      const product = await ProductDAO.getById(item.productId);

      if (!product || !product.isActive) {
        throw new Error(`Sản phẩm không tồn tại.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`"${product.name}" chỉ còn ${product.stock} sản phẩm.`);
      }

      const price =
        product.discountPrice > 0 ? product.discountPrice : product.price;

      // Push vào orderItems
      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        image:
          Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "",
      });

      totalAmount += price * item.quantity;
    }

    const order = await OrderDAO.create({
      customer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Trừ tồn kho (giữ nguyên)
    for (const item of items) {
      await ProductDAO.updateStock(item.productId, item.quantity);
    }

    // ==================== GỬI EMAIL XÁC NHẬN ĐƠN HÀNG ====================
    // Giả định req.user có chứa email (do middleware verifyToken đã gán vào)
    const customerEmail = req.user.email;

    if (customerEmail) {
      // Tạo nội dung HTML cho Email
      const emailHTML = `
        <div style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #fff; border: 2px solid #e60012; padding: 20px;">
            <h1 style="color: #e60012; text-align: center; text-transform: uppercase;">Đặt Hàng Thành Công!</h1>
            <p>Xin chào <strong>${req.user.fullName}</strong>,</p>
            <p>Cảm ơn bạn đã mua sắm tại <strong>GAMING SHOP .VN</strong>. Đơn hàng của bạn đã được ghi nhận.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #e60012; color: white;">
                  <th style="padding: 10px; text-align: left;">Sản phẩm</th>
                  <th style="padding: 10px;">SL</th>
                  <th style="padding: 10px; text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems
                  .map(
                    (item) => `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">${item.name}</td>
                    <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right;">${item.price.toLocaleString("vi-VN")} ₫</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px;">
              Tổng thanh toán: <span style="color: #e60012;">${totalAmount.toLocaleString("vi-VN")} ₫</span>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="text-align: center; color: #666; font-size: 12px;">
              Mã đơn hàng: #${order._id}<br>
              GAMING SHOP .VN - Hệ thống máy tính & phụ kiện Gaming
            </p>
          </div>
        </div>
      `;

      // Gửi email (Không await để không chặn luồng trả về API cho user)
      sendEmail(customerEmail, `Xác nhận đơn hàng #${order._id}`, emailHTML);
    }
    // ========================================================================

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Lỗi checkout:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/orders/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await OrderDAO.getByCustomer(req.user.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CATEGORIES & SEARCH APIs ====================

// GET /api/customer/categories - Lấy tất cả danh mục
router.get("/categories", async (req, res) => {
  try {
    const { Category } = require("../models/Models");
    const categories = await Category.find({ isActive: true }).sort({
      name: 1,
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customer/products/category/:cid - Lọc theo danh mục
router.get("/products/category/:cid", async (req, res) => {
  try {
    const { Product } = require("../models/Models");
    const products = await Product.find({
      category: req.params.cid,
      isActive: true,
    }).populate("category", "name slug");

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customer/products/search/:keyword - Tìm kiếm theo tên
router.get("/products/search/:keyword", async (req, res) => {
  try {
    const { Product } = require("../models/Models");
    const keyword = new RegExp(req.params.keyword, "i"); // 'i' = case insensitive

    const products = await Product.find({
      $or: [{ name: { $regex: keyword } }, { brand: { $regex: keyword } }],
      isActive: true,
    }).populate("category", "name slug");

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CUSTOMER PROFILE & ORDERS APIs ====================

// GET /api/customer/profile - Lấy thông tin user hiện tại
// GET /api/customer/profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { Customer } = require('../models/Models');
    
    console.log('User ID from token:', req.user.id); // Debug log
    
    const customer = await Customer.findById(req.user.id)
      .select('-password -activationToken -activationTokenExpiry');
    
    console.log('Found customer:', customer); // Debug log
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user.' });
    }
    
    res.json({ 
      success: true, 
      data: customer 
    });
  } catch (error) {
    console.error('Lỗi GET profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/customer/profile - Cập nhật thông tin user
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { Customer } = require("../models/Models");
    const { fullName, phone, address } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName.trim();
    if (phone) updateData.phone = phone.trim();
    if (address) updateData.address = address.trim();

    // Nếu có password mới, hash và cập nhật
    if (req.body.newPassword && req.body.newPassword.length >= 6) {
      const bcrypt = require("bcryptjs");
      updateData.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true },
    ).select("-password -activationToken -activationTokenExpiry");

    if (!updatedCustomer)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user." });

    res.json({
      success: true,
      updatedCustomer,
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customer/orders/my-orders - Đã có từ bước trước, đảm bảo populate đầy đủ
// (Nếu chưa có, thêm code này)
router.get("/orders/my-orders", verifyToken, async (req, res) => {
  try {
    const { Order } = require("../models/Models");
    const orders = await Order.find({ customer: req.user.id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
