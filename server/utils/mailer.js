const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error) => {
  if (error) console.warn('⚠️ Cấu hình Email chưa đúng. Vui lòng kiểm tra .env');
  else console.log('✅ Mailer sẵn sàng gửi email kích hoạt.');
});

module.exports = transporter;