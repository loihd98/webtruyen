import React from "react";
import { Metadata } from "next";
import Layout from "../../components/layout/Layout";
import ContactForm from "../../components/contact/ContactForm";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Liên hệ - khotruyen.vn",
  description:
    "Liên hệ với đội ngũ khotruyen.vn để được hỗ trợ, góp ý hoặc báo cáo vấn đề. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.",
  openGraph: {
    title: "Liên hệ - khotruyen.vn",
    description:
      "Liên hệ với đội ngũ khotruyen.vn để được hỗ trợ, góp ý hoặc báo cáo vấn đề. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto animate-slide-up animation-delay-200">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Quick Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up animation-delay-300">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">
                Email hỗ trợ
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm mb-2">
                support@webtruyen.com
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                Phản hồi trong 24h
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">🐛</div>
              <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                Báo lỗi
              </h3>
              <p className="text-green-600 dark:text-green-400 text-sm mb-2">
                bugs@webtruyen.com
              </p>
              <p className="text-green-700 dark:text-green-300 text-xs">
                Ưu tiên xử lý cao
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 text-center">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-2">
                Góp ý tính năng
              </h3>
              <p className="text-purple-600 dark:text-purple-400 text-sm mb-2">
                feedback@webtruyen.com
              </p>
              <p className="text-purple-700 dark:text-purple-300 text-xs">
                Ý kiến được đánh giá cao
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-slide-up animation-delay-400">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">✉️</span>Gửi tin nhắn
                </h2>
                <ContactForm />
              </div>
            </div>

            {/* Contact Information & FAQ */}
            <div className="space-y-8 animate-slide-up animation-delay-500">
              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">📍</span>Thông tin liên hệ
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">🌐</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        Website
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        www.webtruyen.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">📱</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        Hotline hỗ trợ
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        1900-xxx-xxx (8:00 - 22:00)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-3 mt-1">💬</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        Live Chat
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Góc dưới phải màn hình
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-orange-500 mr-3 mt-1">🏢</span>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        Địa chỉ công ty
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        123 Đường ABC, Quận XYZ, TP.HCM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick FAQ */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">❓</span>Câu hỏi thường gặp
                </h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Làm sao để tạo tài khoản?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nhấn nút "Đăng ký" ở góc phải trên, điền email và mật
                      khẩu.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Có mất phí không?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      khotruyen.vn hoàn toàn miễn phí cho tất cả người dùng.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Tại sao không nghe được audio?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Kiểm tra kết nối mạng và thử refresh trang. Liên hệ nếu
                      vẫn lỗi.
                    </p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Làm sao báo cáo nội dung vi phạm?
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sử dụng nút "Báo cáo" trên mỗi truyện hoặc liên hệ trực
                      tiếp.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Xem thêm câu hỏi tại{" "}
                    <a
                      href="/help"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      trang Hỗ trợ
                    </a>
                  </p>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <span className="mr-2">⏰</span>Thời gian phản hồi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      24h
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Email thường
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      2h
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Lỗi khẩn cấp
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Categories */}
          <div className="mt-16 animate-slide-up animation-delay-600">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              Chúng tôi có thể giúp gì cho bạn?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Hỗ trợ kỹ thuật
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lỗi trang web, không tải được, âm thanh không hoạt động
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">👤</div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Quản lý tài khoản
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Đăng ký, đăng nhập, đổi mật khẩu, cập nhật thông tin
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Nội dung truyện
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Yêu cầu thêm truyện, báo lỗi nội dung, góp ý chất lượng
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">⚖️</div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Pháp lý & DMCA
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Báo cáo vi phạm bản quyền, khiếu nại pháp lý
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
