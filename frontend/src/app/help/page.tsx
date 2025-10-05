import React from "react";
import { Metadata } from "next";
import Layout from "../../components/layout/Layout";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Trợ Giúp - khotruyen.vn",
  description:
    "Hướng dẫn sử dụng khotruyen.vn, câu hỏi thường gặp và cách thức hoạt động của trang web đọc truyện online.",
  openGraph: {
    title: "Trợ Giúp - khotruyen.vn",
    description:
      "Hướng dẫn sử dụng khotruyen.vn, câu hỏi thường gặp và cách thức hoạt động của trang web đọc truyện online.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: "/help",
  },
};

const faqData = [
  {
    id: 1,
    question: "Làm thế nào để đọc truyện trên khotruyen.vn?",
    answer:
      "Bạn có thể duyệt qua kho truyện từ trang chủ, tìm kiếm theo tên truyện hoặc thể loại. Nhấp vào truyện muốn đọc và chọn chương để bắt đầu đọc.",
    category: "Cơ bản",
  },
  {
    id: 2,
    question: "Tôi có cần đăng ký tài khoản để đọc truyện không?",
    answer:
      "Không bắt buộc. Bạn có thể đọc miễn phí mà không cần đăng ký. Tuy nhiên, việc tạo tài khoản sẽ giúp bạn lưu bookmark, theo dõi tiến độ đọc và nhận thông báo chương mới.",
    category: "Tài khoản",
  },
  {
    id: 3,
    question: "Làm sao để nghe truyện audio?",
    answer:
      'Tìm các truyện có nhãn "Audio" hoặc lọc theo loại "Truyện Audio". Nhấp vào truyện và chọn chương, trình phát audio sẽ tự động hiển thị.',
    category: "Audio",
  },
  {
    id: 4,
    question: "Tại sao một số chương bị khóa?",
    answer:
      "Một số chương có thể yêu cầu đăng ký tài khoản hoặc đạt điều kiện nhất định để đọc. Điều này giúp hỗ trợ tác giả và duy trì chất lượng nội dung.",
    category: "Nội dung",
  },
  {
    id: 5,
    question: "Làm thế nào để bookmark truyện yêu thích?",
    answer:
      'Đăng nhập vào tài khoản, vào trang truyện muốn bookmark và nhấp vào nút "Thêm vào bookmark" hoặc biểu tượng trái tim.',
    category: "Tính năng",
  },
  {
    id: 6,
    question: "Tôi có thể đọc offline không?",
    answer:
      "Hiện tại trang web chỉ hỗ trợ đọc online. Chúng tôi đang phát triển tính năng download để đọc offline trong tương lai.",
    category: "Tính năng",
  },
  {
    id: 7,
    question: "Làm sao để báo cáo nội dung vi phạm?",
    answer:
      'Sử dụng nút "Báo cáo" trên mỗi chương hoặc gửi email đến support@webtruyen.com với thông tin chi tiết về vi phạm.',
    category: "Báo cáo",
  },
  {
    id: 8,
    question: "Trang web có thu phí không?",
    answer:
      "khotruyen.vn hoàn toàn miễn phí. Chúng tôi không thu phí đọc truyện hay nghe audio. Chi phí duy trì được trang trải từ quảng cáo và tài trợ.",
    category: "Chi phí",
  },
];

export default function HelpPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
            Trợ Giúp
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-slide-up animation-delay-200">
            Tìm hiểu cách sử dụng khotruyen.vn một cách hiệu quả nhất
          </p>
        </div>

        {/* Quick Guide */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 mb-12 animate-slide-up animation-delay-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🚀 Hướng dẫn nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl">
                1
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Tìm truyện
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Duyệt qua kho truyện hoặc tìm kiếm theo tên
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl">
                2
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Chọn chương
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nhấp vào truyện và chọn chương muốn đọc
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl">
                3
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Thưởng thức
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Đọc truyện chữ hoặc nghe truyện audio
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl">
                4
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Lưu yêu thích
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bookmark để theo dõi tiến độ đọc
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12 animate-slide-up animation-delay-400">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            💡 Câu hỏi thường gặp
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {faqData.map((faq, index) => (
              <div
                key={faq.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-fade-in-scale"
                style={{ animationDelay: `${(index + 5) * 100}ms` }}
              >
                <div className="flex items-start mb-3">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3 mt-1">
                    {faq.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center animate-slide-up animation-delay-500">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🤝 Vẫn cần hỗ trợ?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Nếu bạn không tìm thấy câu trả lời cho vấn đề của mình, đừng ngần
            ngại liên hệ với chúng tôi. Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24
            giờ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              📧 Gửi tin nhắn
            </a>
            <a
              href="mailto:support@webtruyen.com"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              ✉️ Email trực tiếp
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
