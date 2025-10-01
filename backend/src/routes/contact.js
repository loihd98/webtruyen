const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiting for contact form - more restrictive
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 contact form submissions per windowMs
  message: {
    error: "Too Many Requests",
    message: "Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau 15 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact form submission
router.post("/", contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Định dạng email không hợp lệ",
      });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Nội dung tin nhắn phải có ít nhất 10 ký tự",
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Nội dung tin nhắn không được vượt quá 5000 ký tự",
      });
    }

    // Create transporter for sending emails
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("SMTP credentials not configured");
      return res.status(500).json({
        error: "Configuration Error",
        message: "Email service không được cấu hình. Vui lòng liên hệ admin.",
      });
    }

    // Category labels for better readability
    const categoryLabels = {
      general: "Câu hỏi chung",
      technical: "Hỗ trợ kỹ thuật",
      account: "Vấn đề tài khoản",
      content: "Nội dung truyện",
      bug: "Báo lỗi",
      feature: "Đề xuất tính năng",
      legal: "Pháp lý / DMCA",
      other: "Khác",
    };

    // Email content for admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Tin nhắn mới từ Web Truyện Contact Form
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Thông tin người gửi</h3>
          <p><strong>Họ tên:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Loại yêu cầu:</strong> ${
            categoryLabels[category] || category
          }</p>
          <p><strong>Tiêu đề:</strong> ${subject}</p>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString(
            "vi-VN"
          )}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Nội dung tin nhắn</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Lưu ý:</strong> Hãy phản hồi người dùng trong vòng 24 giờ để duy trì chất lượng dịch vụ.
          </p>
        </div>
      </div>
    `;

    // Email content for user confirmation
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Cảm ơn bạn đã liên hệ với Web Truyện
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Xin chào ${name},</h3>
          <p style="line-height: 1.6;">
            Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất. 
            Dưới đây là bản sao tin nhắn bạn đã gửi:
          </p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Thông tin tin nhắn</h4>
          <p><strong>Tiêu đề:</strong> ${subject}</p>
          <p><strong>Loại yêu cầu:</strong> ${
            categoryLabels[category] || category
          }</p>
          <p><strong>Thời gian gửi:</strong> ${new Date().toLocaleString(
            "vi-VN"
          )}</p>
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;">
          <p style="line-height: 1.6; white-space: pre-wrap;"><strong>Nội dung:</strong><br>${message}</p>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #004085;">
            <strong>Lưu ý:</strong> Nếu bạn không gửi tin nhắn này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            Trân trọng,<br>
            <strong>Đội ngũ Web Truyện</strong>
          </p>
        </div>
      </div>
    `;

    // Send email to admin
    const adminMailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `[Web Truyện Contact] ${subject}`,
      html: adminEmailHtml,
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: `"Web Truyện Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Xác nhận tin nhắn: ${subject}`,
      html: userEmailHtml,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    res.status(200).json({
      success: true,
      message:
        "Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi bạn sớm nhất có thể.",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    // Handle specific nodemailer errors
    if (error.code === "EAUTH") {
      return res.status(500).json({
        error: "Email Configuration Error",
        message: "Lỗi xác thực email server. Vui lòng thử lại sau.",
      });
    }

    if (error.code === "ECONNECTION") {
      return res.status(500).json({
        error: "Email Service Error",
        message: "Không thể kết nối đến email server. Vui lòng thử lại sau.",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
    });
  }
});

module.exports = router;
