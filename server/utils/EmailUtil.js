const nodemailer = require('nodemailer');

// Cấu hình Transporter kết nối Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App Password (16 ký tự)
  }
});

// Hàm tổng quát gửi Email với Defensive Programming
exports.sendEmail = async (to, subject, htmlContent) => {
  try {
    // Kiểm tra email hợp lệ trước khi gửi
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!to || !emailRegex.test(to)) {
      console.error('❌ Email không hợp lệ:', to);
      return false;
    }

    const mailOptions = {
      from: `"GAMING SHOP .VN" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    return false;
  }
};