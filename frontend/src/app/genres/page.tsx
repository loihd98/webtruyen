import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Layout from "../../components/layout/Layout";

// Server-side data fetching
async function getGenres() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${baseUrl}/stories/genres`, {
      next: { revalidate: 3600 }, // ISR: revalidate every hour
    });

    if (!response.ok) {
      throw new Error("Failed to fetch genres");
    }

    const result = await response.json();
    return result.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Thể Loại Truyện - Web Truyện",
  description:
    "Khám phá các thể loại truyện đa dạng: Tiên Hiệp, Đô Thị, Huyền Huyễn, Kiếm Hiệp, Ngôn Tình và nhiều thể loại khác.",
  openGraph: {
    title: "Thể Loại Truyện - Web Truyện",
    description:
      "Khám phá các thể loại truyện đa dạng: Tiên Hiệp, Đô Thị, Huyền Huyễn, Kiếm Hiệp, Ngôn Tình và nhiều thể loại khác.",
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: "/genres",
  },
};

interface Genre {
  id: string;
  name: string;
  slug: string;
  _count: {
    stories: number;
  };
}

export default async function GenresPage() {
  const genres: Genre[] = (await getGenres()) || [];

  // Add default descriptions for genres if not provided by API
  const getGenreDescription = (genreName: string) => {
    const descriptions: { [key: string]: string } = {
      "Tiên Hiệp":
        "Tu tiên, tu chân, tu thần, các câu chuyện về việc tu luyện để trở thành tiên nhân.",
      "Đô Thị":
        "Câu chuyện hiện đại, đời sống thành thị, tình yêu và sự nghiệp trong xã hội hiện tại.",
      "Huyền Huyễn":
        "Thế giới kỳ ảo, phép thuật, ma pháp và những cuộc phiêu lưu không tưởng.",
      "Kiếm Hiệp":
        "Võ lâm, giang hồ, kiếm pháp và những câu chuyện anh hùng hào kiệt.",
      "Ngôn Tình":
        "Tình yêu lãng mạn, câu chuyện tình cảm ngọt ngào và cảm động.",
      "Quan Trường":
        "Chính trị, quyền lực, đấu tranh trong triều đình và quan trường.",
      "Lịch Sử":
        "Dựa trên sự kiện lịch sử, nhân vật lịch sử và bối cảnh thời đại xưa.",
      "Khoa Huyễn":
        "Tương lai, công nghệ, vũ trụ và những câu chuyện viễn tưởng.",
      "Trinh Thám": "Phá án, điều tra, bí ẩn và những câu chuyện hồi hộp.",
      "Võng Du": "Game online, thế giới ảo và những cuộc phiêu lưu trong game.",
    };
    return (
      descriptions[genreName] ||
      "Khám phá những câu chuyện thú vị trong thể loại này."
    );
  };

  return (
    <Layout>
      <div className="py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 animate-slide-up">
            🏷️ Thể Loại Truyện
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto animate-slide-up animation-delay-200">
            Khám phá các thể loại truyện đa dạng và phong phú. Tìm kiếm những
            câu chuyện phù hợp với sở thích của bạn.
          </p>
        </div>

        {/* Genres Grid */}
        {genres.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {genres.map((genre: Genre, index: number) => (
              <Link
                key={genre.id}
                href={`/stories?genre=${encodeURIComponent(genre.slug)}`}
                className="group"
              >
                <div
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 animate-fade-in-scale hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 group-hover:bg-blue-600 transition-colors duration-300"></div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {genre.name}
                      </h3>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm px-2 py-1 rounded-full">
                      {genre._count.stories}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {getGenreDescription(genre.name)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏷️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chưa có thể loại nào
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Hệ thống đang cập nhật các thể loại truyện. Vui lòng quay lại sau.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white animate-slide-up animation-delay-500">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Không tìm thấy thể loại yêu thích?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Khám phá tất cả các truyện trong kho tàng của chúng tôi
          </p>
          <Link
            href="/stories"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            📚 Xem Tất Cả Truyện
          </Link>
        </div>
      </div>
    </Layout>
  );
}
