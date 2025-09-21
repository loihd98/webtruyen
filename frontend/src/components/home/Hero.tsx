"use client";

import React from "react";
import Link from "next/link";

const Hero: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-6">Kho Truyện Số 1 Việt Nam</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Đọc và nghe hàng ngàn câu chuyện hay từ các tác giả tài năng. Trải
          nghiệm đọc truyện hoàn toàn mới với tính năng audio chất lượng cao.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/stories"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            📚 Khám phá truyện
          </Link>
          <Link
            href="/stories?type=AUDIO"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            🎧 Nghe truyện audio
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-2">Đọc miễn phí</h3>
            <p className="text-blue-100">
              Hàng ngàn truyện hay hoàn toàn miễn phí
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🎧</div>
            <h3 className="text-xl font-semibold mb-2">Audio chất lượng</h3>
            <p className="text-blue-100">
              Trải nghiệm nghe truyện với âm thanh sống động
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Mọi thiết bị</h3>
            <p className="text-blue-100">
              Đọc mọi lúc mọi nơi trên điện thoại, máy tính
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
