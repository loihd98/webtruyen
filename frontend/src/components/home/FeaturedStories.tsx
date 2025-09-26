"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StoryCard from "../stories/StoryCard";
import { storiesAPI } from "../../utils/api";
import { Story } from "../../types";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturedStories: React.FC = () => {
  const { t } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [audioStories, setAudioStories] = useState<Story[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeaturedStories();
  }, [currentPage]);

  const fetchFeaturedStories = async () => {
    try {
      setIsLoading(true);

      const [textStories, audioStoriesRes, trendingRes, recentRes] =
        await Promise.all([
          storiesAPI.getStories({ type: "TEXT", limit: 12, page: currentPage }),
          storiesAPI.getStories({ type: "AUDIO", limit: 8 }),
          storiesAPI.getStories({ sort: "viewCount", limit: 6 }), // Trending by views
          storiesAPI.getStories({ sort: "updatedAt", limit: 8 }), // Recently updated
        ]);

      setStories(textStories.data?.data || []);
      setTotalPages(textStories.data?.pagination?.pages || 1);
      setAudioStories(audioStoriesRes.data?.data || []);
      setTrendingStories(trendingRes.data?.data || []);
      setRecentStories(recentRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching featured stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content skeleton */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-6 w-64"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-600"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-32"></div>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex space-x-3 mb-4">
                  <div className="w-12 h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-12">
          {/* Text Stories Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                📖 <span className="ml-2">{t("home.featured.text")}</span>
              </h2>
              <Link
                href="/stories?type=TEXT"
                className="text-blue-600 hover:text-blue-500 font-medium text-sm flex items-center"
              >
                {t("common.view_all")}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {stories.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} variant="compact" />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }).map(
                        (_, index) => {
                          const page =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPage - 2)
                            ) + index;
                          if (page > totalPages) return null;

                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-md text-sm font-medium ${
                                currentPage === page
                                  ? "bg-blue-600 text-white"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📚</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Chưa có truyện văn bản nào.
                </p>
              </div>
            )}
          </section>

          {/* Audio Stories Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                🎧 <span className="ml-2">{t("home.featured.audio")}</span>
              </h2>
              <Link
                href="/stories?type=AUDIO"
                className="text-blue-600 hover:text-blue-500 font-medium text-sm flex items-center"
              >
                {t("common.view_all")}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {audioStories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {audioStories.map((story) => (
                  <StoryCard key={story.id} story={story} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">🎧</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Chưa có truyện audio nào.
                </p>
              </div>
            )}
          </section>

          {/* Recently Updated Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                🆕 <span className="ml-2">{t("home.featured.recent")}</span>
              </h2>
            </div>

            {recentStories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentStories.map((story) => (
                  <StoryCard key={story.id} story={story} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-3xl mb-3">🆕</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Chưa có cập nhật mới.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            {/* Trending Stories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                🔥 <span className="ml-2">{t("home.trending")}</span>
              </h3>

              {trendingStories.length > 0 ? (
                <div className="space-y-4">
                  {trendingStories.map((story, index) => (
                    <Link
                      key={story.id}
                      href={`/stories/${story.slug}`}
                      className="block group"
                    >
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          {story.thumbnailUrl && (
                            <img
                              src={story.thumbnailUrl}
                              alt={story.title}
                              className="w-12 h-16 object-cover rounded mb-2"
                            />
                          )}
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                            {story.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {story.author?.name || "Tác giả không xác định"}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-400">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {story.viewCount || 0}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Chưa có truyện trending.
                </p>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📋 {t("home.categories")}
              </h3>
              <div className="space-y-2">
                <Link
                  href="/genres"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  🏷️ Thể loại
                </Link>
                <Link
                  href="/stories?sort=viewCount"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  👀 Xem nhiều nhất
                </Link>
                <Link
                  href="/stories?sort=createdAt"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ❤️ Mới nhất
                </Link>
                <Link
                  href="/stories?status=COMPLETED"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ✅ Truyện hoàn thành
                </Link>
                <Link
                  href="/stories?status=ONGOING"
                  className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  🔄 Đang cập nhật
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedStories;
