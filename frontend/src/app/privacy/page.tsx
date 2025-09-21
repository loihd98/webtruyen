import React from "react";
import { Metadata } from "next";
import Layout from "../../components/layout/Layout";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Chính sách bảo mật - Web Truyện",
  description:
    "Chính sách bảo mật và xử lý dữ liệu cá nhân của Web Truyện. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.",
  openGraph: {
    title: "Chính sách bảo mật - Web Truyện",
    description:
      "Chính sách bảo mật và xử lý dữ liệu cá nhân của Web Truyện. Tìm hiểu cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
            Chính sách bảo mật
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            Chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 animate-slide-up animation-delay-300">
            Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Privacy Summary */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8 animate-slide-up animation-delay-300">
            <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-4 flex items-center">
              <span className="mr-2">🔒</span>Cam kết bảo mật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Mã hóa dữ liệu
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  SSL/TLS encryption
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔐</div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Không chia sẻ
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Dữ liệu với bên thứ 3
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  Quyền kiểm soát
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Xóa dữ liệu bất cứ lúc nào
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 animate-slide-up animation-delay-400">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                1. Thông tin chúng tôi thu thập
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Thông tin bạn cung cấp trực tiếp:
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>
                  <strong>Thông tin tài khoản:</strong> Email, tên hiển thị, mật
                  khẩu (được mã hóa)
                </li>
                <li>
                  <strong>Thông tin hồ sơ:</strong> Ảnh đại diện, tiểu sử cá
                  nhân (tùy chọn)
                </li>
                <li>
                  <strong>Tương tác:</strong> Bình luận, đánh giá, bookmark
                </li>
                <li>
                  <strong>Liên hệ:</strong> Tin nhắn qua form liên hệ, email hỗ
                  trợ
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Thông tin được thu thập tự động:
              </h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-2">
                <li>
                  <strong>Thông tin thiết bị:</strong> IP address, loại trình
                  duyệt, hệ điều hành
                </li>
                <li>
                  <strong>Thông tin sử dụng:</strong> Trang được xem, thời gian
                  trên trang, tần suất truy cập
                </li>
                <li>
                  <strong>Cookies:</strong> Preferences, session ID, analytics
                  data
                </li>
                <li>
                  <strong>Log files:</strong> Thời gian truy cập, lỗi hệ thống,
                  performance metrics
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                2. Cách chúng tôi sử dụng thông tin
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Cung cấp dịch vụ
                  </h3>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Tạo và quản lý tài khoản</li>
                    <li>• Cá nhân hóa trải nghiệm</li>
                    <li>• Lưu bookmark và tiến độ đọc</li>
                    <li>• Gửi thông báo cập nhật</li>
                  </ul>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                    Cải thiện dịch vụ
                  </h3>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Phân tích hành vi người dùng</li>
                    <li>• Tối ưu hóa hiệu suất</li>
                    <li>• Phát triển tính năng mới</li>
                    <li>• Khắc phục lỗi và bảo trì</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                3. Chia sẻ thông tin
              </h2>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center">
                  <span className="mr-2">🚫</span>Chúng tôi KHÔNG bao giờ:
                </h3>
                <ul className="text-red-700 dark:text-red-300 space-y-2">
                  <li>• Bán thông tin cá nhân cho bên thứ ba</li>
                  <li>• Chia sẻ dữ liệu với mục đích marketing</li>
                  <li>• Cung cấp thông tin cho các công ty quảng cáo</li>
                  <li>
                    • Chuyển giao dữ liệu ra nước ngoài không có sự đồng ý
                  </li>
                </ul>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                <strong>Trường hợp ngoại lệ:</strong> Chúng tôi chỉ chia sẻ
                thông tin khi:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                <li>Có lệnh của cơ quan pháp luật có thẩm quyền</li>
                <li>Bảo vệ quyền lợi hợp pháp của Web Truyện</li>
                <li>Ngăn chặn gian lận hoặc tội phạm mạng</li>
                <li>Bảo vệ an toàn của người dùng khác</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                4. Bảo mật dữ liệu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Bảo mật kỹ thuật
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Mã hóa SSL/TLS cho tất cả dữ liệu</li>
                    <li>• Hashing password với bcrypt</li>
                    <li>• Firewall và intrusion detection</li>
                    <li>• Regular security audits</li>
                  </ul>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Bảo mật vận hành
                  </h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Access control và permissions</li>
                    <li>• Backup dữ liệu định kỳ</li>
                    <li>• Monitoring và logging</li>
                    <li>• Incident response procedures</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                5. Cookies và tracking
              </h2>
              <div className="space-y-4 mb-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    Essential Cookies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Cần thiết cho hoạt động của website (session,
                    authentication)
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    Analytics Cookies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Giúp hiểu cách người dùng tương tác với website (có thể tắt)
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    Preference Cookies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lưu trữ cài đặt cá nhân (theme, language, reading
                    preferences)
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                6. Quyền của người dùng
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-4">
                  Bạn có quyền:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                    <li>
                      ✅ <strong>Truy cập:</strong> Xem dữ liệu chúng tôi có về
                      bạn
                    </li>
                    <li>
                      ✅ <strong>Sửa đổi:</strong> Cập nhật thông tin cá nhân
                    </li>
                    <li>
                      ✅ <strong>Xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu
                    </li>
                    <li>
                      ✅ <strong>Xuất:</strong> Tải về dữ liệu của bạn
                    </li>
                  </ul>
                  <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                    <li>
                      ✅ <strong>Hạn chế:</strong> Giới hạn xử lý dữ liệu
                    </li>
                    <li>
                      ✅ <strong>Phản đối:</strong> Từ chối một số hoạt động xử
                      lý
                    </li>
                    <li>
                      ✅ <strong>Khiếu nại:</strong> Liên hệ cơ quan bảo vệ dữ
                      liệu
                    </li>
                    <li>
                      ✅ <strong>Rút lại:</strong> Thu hồi sự đồng ý bất cứ lúc
                      nào
                    </li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                7. Lưu trữ và xóa dữ liệu
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">📅</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      Tài khoản hoạt động
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dữ liệu được lưu trữ miễn là tài khoản còn hoạt động
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-yellow-500 mr-3 mt-1">⏰</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      Tài khoản không hoạt động
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tự động xóa sau 2 năm không đăng nhập
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">🗑️</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      Yêu cầu xóa
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Xóa hoàn toàn trong vòng 30 ngày kể từ khi yêu cầu
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                8. Dữ liệu trẻ em
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Web Truyện không cố ý thu thập thông tin cá nhân từ trẻ em dưới
                13 tuổi. Nếu chúng tôi phát hiện đã thu thập thông tin như vậy,
                chúng tôi sẽ xóa ngay lập tức. Phụ huynh có thể liên hệ với
                chúng tôi nếu cho rằng con em mình đã cung cấp thông tin cá
                nhân.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                9. Thay đổi chính sách
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Chúng tôi có thể cập nhật chính sách bảo mật này để phản ánh các
                thay đổi trong hoạt động kinh doanh hoặc yêu cầu pháp lý. Những
                thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo
                nổi bật trên website ít nhất 30 ngày trước khi có hiệu lực.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                10. Liên hệ về bảo mật
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Nếu bạn có câu hỏi về chính sách bảo mật hoặc cách chúng tôi
                  xử lý dữ liệu của bạn:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Data Protection Officer:</strong>{" "}
                    privacy@webtruyen.com
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Security Issues:</strong> security@webtruyen.com
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <strong>Form liên hệ:</strong>{" "}
                    <a
                      href="/contact"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      webtruyen.com/contact
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Request */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 animate-slide-up animation-delay-500">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <span className="mr-2">📋</span>Yêu cầu dữ liệu cá nhân
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed mb-3">
              Để thực hiện quyền truy cập, sửa đổi, hoặc xóa dữ liệu cá nhân,
              vui lòng gửi yêu cầu qua email hoặc form liên hệ. Chúng tôi sẽ
              phản hồi trong vòng 72 giờ.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                GDPR Compliant
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                ISO 27001
              </span>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                Luật An ninh mạng VN
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
