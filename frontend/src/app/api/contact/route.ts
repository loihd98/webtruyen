import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, subject, category, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin bắt buộc" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Định dạng email không hợp lệ" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Nội dung tin nhắn phải có ít nhất 10 ký tự" },
        { status: 400 }
      );
    }

    // Create transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: "gmail", // You can change this to your email service
      auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // Your email password or app password
      },
    });

    // Category labels for better readability
    const categoryLabels: { [key: string]: string } = {
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
          <h3 style="color: #28a745; margin-top: 0;">✅ Tin nhắn đã được gửi thành công</h3>
          <p>Xin chào <strong>${name}</strong>,</p>
          <p>Chúng tôi đã nhận được tin nhắn của bạn với tiêu đề: <strong>"${subject}"</strong></p>
          <p>Loại yêu cầu: <strong>${
            categoryLabels[category] || category
          }</strong></p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Nội dung bạn đã gửi</h3>
          <p style="line-height: 1.6; white-space: pre-wrap; background-color: #f8f9fa; padding: 15px; border-radius: 4px;">${message}</p>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1976d2; margin-top: 0;">⏰ Thời gian phản hồi dự kiến</h4>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Email thường:</strong> Trong vòng 24 giờ</li>
            <li><strong>Báo lỗi khẩn cấp:</strong> Trong vòng 2 giờ</li>
            <li><strong>Yêu cầu pháp lý:</strong> Trong vòng 72 giờ</li>
          </ul>
        </div>
        
        <div style="background-color: #f1f3f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>Lưu ý:</strong> Email này được gửi tự động. Vui lòng không reply trực tiếp. 
            Nếu có thắc mắc khẩn cấp, liên hệ: support@webtruyen.com
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666;">Trân trọng,<br><strong>Đội ngũ Web Truyện</strong></p>
        </div>
      </div>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || "admin@webtruyen.com",
      subject: `[Web Truyện Contact] ${categoryLabels[category]} - ${subject}`,
      html: adminEmailHtml,
      replyTo: email, // Allow admin to reply directly to user
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Xác nhận: Tin nhắn của bạn đã được gửi - Web Truyện",
      html: userEmailHtml,
    });

    // Log the contact form submission (optional)
    console.log(
      `[Contact Form] New message from ${name} (${email}) - Category: ${category}`
    );

    return NextResponse.json({
      success: true,
      message: "Tin nhắn đã được gửi thành công",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        error: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
