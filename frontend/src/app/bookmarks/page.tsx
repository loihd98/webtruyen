"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RootState } from "../../store";
import { getMediaUrl } from "../../utils/media";
import Layout from "@/components/layout/Layout";
import apiClient from "@/utils/api";

interface Bookmark {
  id: string;
  createdAt: string;
  story: {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    type: "TEXT" | "AUDIO";
    viewCount: number;
    author: {
      name: string;
    };
    genres: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    createdAt: string;
  };
}

export default function BookmarksPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "TEXT" | "AUDIO">("ALL");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    fetchBookmarks();
  }, [isAuthenticated, currentPage, filter]);

  // ✅ Sửa lại dùng apiClient
  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {
        page: currentPage.toString(),
        limit: "12",
      };
      if (filter !== "ALL") params.type = filter;

      const response = await apiClient.get("/bookmarks", { params });

      setBookmarks(response?.data.bookmarks);
      setTotalPages(response?.data.totalPages);
      setTotalBookmarks(response?.data.total);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setError("Có lỗi xảy ra khi tải danh sách bookmark");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sửa lại dùng apiClient
  const removeBookmark = async (bookmarkId: string) => {
    try {
      await apiClient.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
      setTotalBookmarks(totalBookmarks - 1);
    } catch (error) {
      console.error("Error removing bookmark:", error);
      alert("Có lỗi xảy ra khi xóa bookmark");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    📚 Truyện đã yêu thích
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {totalBookmarks} truyện đã được đánh dấu yêu thích
                  </p>
                </div>

                {/* Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Lọc:
                  </span>
                  <select
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value as "ALL" | "TEXT" | "AUDIO");
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="TEXT">📖 Text</option>
                    <option value="AUDIO">🎧 Audio</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😞</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Có lỗi xảy ra
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                  onClick={fetchBookmarks}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && bookmarks?.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Chưa có truyện yêu thích
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Hãy khám phá và đánh dấu những truyện bạn yêu thích!
                </p>
                <button
                  onClick={() => router.push("/stories")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Khám phá truyện
                </button>
              </div>
            )}

            {/* Bookmarks Grid */}
            {!loading && !error && bookmarks?.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {bookmarks?.map((bookmark) => (
                    <div
                      key={bookmark?.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {bookmark?.story?.thumbnailUrl ? (
                          <Image
                            src={getMediaUrl(bookmark?.story?.thumbnailUrl)}
                            alt={bookmark?.story?.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <div className="text-4xl text-gray-400">
                              {bookmark?.story?.type === "AUDIO" ? "🎧" : "📖"}
                            </div>
                          </div>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              bookmark?.story?.type === "AUDIO"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            }`}
                          >
                            {bookmark?.story?.type === "AUDIO"
                              ? "🎧 Audio"
                              : "📖 Text"}
                          </span>
                        </div>

                        {/* Remove Bookmark */}
                        <button
                          onClick={() => removeBookmark(bookmark?.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Xóa khỏi yêu thích"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3
                          className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() =>
                            router.push(`/stories/${bookmark?.story?.slug}`)
                          }
                        >
                          {bookmark?.story?.title}
                        </h3>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          👤 {bookmark?.story?.author?.name}
                        </p>

                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {bookmark?.story?.description || "Chưa có mô tả"}
                        </p>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {bookmark?.story?.genres?.slice(0, 2).map((genre) => (
                            <span
                              key={genre.id}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                            >
                              {genre.name}
                            </span>
                          ))}
                          {bookmark?.story?.genres?.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                              +{bookmark?.story?.genres.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            👁️ {bookmark?.story?.viewCount?.toLocaleString()}
                          </span>
                          <span>
                            📅{" "}
                            {new Date(bookmark?.createdAt)?.toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + Math.max(1, currentPage - 2);
                      if (page > totalPages) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
