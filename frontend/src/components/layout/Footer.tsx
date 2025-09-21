import React from "react";
import Link from "next/link";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                📚 Web Truyện
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm max-w-md">
              Nền tảng đọc và nghe truyện online hàng đầu Việt Nam. Khám phá
              hàng ngàn câu chuyện hấp dẫn với chất lượng âm thanh tuyệt vời.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.316-1.297c-.867-.808-1.297-1.781-1.297-2.918c0-1.297.49-2.398 1.468-3.316c.978-.918 2.162-1.377 3.551-1.377c1.297 0 2.448.459 3.456 1.377c1.008.918 1.512 2.019 1.512 3.316c0 1.137-.43 2.11-1.297 2.918c-.867.807-2.019 1.297-3.456 1.297h-.621zm8.414.621c-.459 0-.867-.153-1.224-.459c-.357-.306-.535-.673-.535-1.102c0-.429.178-.796.535-1.102c.357-.306.765-.459 1.224-.459c.459 0 .867.153 1.224.459c.357.306.535.673.535 1.102c0 .429-.178.796-.535 1.102c-.357.306-.765.459-1.224.459z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">YouTube</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Khám phá
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/stories"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Tất cả truyện
                </Link>
              </li>
              <li>
                <Link
                  href="/stories?type=TEXT"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Truyện văn
                </Link>
              </li>
              <li>
                <Link
                  href="/stories?type=AUDIO"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Truyện audio
                </Link>
              </li>
              <li>
                <Link
                  href="/genres"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Thể loại
                </Link>
              </li>
              <li>
                <Link
                  href="/stories?sort=popular"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Phổ biến
                </Link>
              </li>
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
              Hỗ trợ
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href="/help"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Trợ giúp
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-base text-gray-400 dark:text-gray-500">
              &copy; 2024 Web Truyện. Tất cả quyền được bảo lưu.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link
                href="/sitemap"
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
              >
                Sitemap
              </Link>
              <Link
                href="/rss"
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
              >
                RSS
              </Link>
              <Link
                href="/api-docs"
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
              >
                API
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
