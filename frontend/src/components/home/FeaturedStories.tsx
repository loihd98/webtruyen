"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StoryCard from "../stories/StoryCard";
import { storiesAPI } from "../../utils/api";
import { Story } from "../../types";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMediaUrl } from "../../utils/media";
import Pagination from "../ui/Pagination";
import { useRouter } from "next/navigation";

const FeaturedStories: React.FC = () => {
  const { t } = useLanguage();
  const router = useRouter();

  // Separate story states
  const [textStories, setTextStories] = useState<Story[]>([]);
  const [audioStories, setAudioStories] = useState<Story[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);

  // Separate loading states
  const [isLoadingText, setIsLoadingText] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  // Separate pagination states
  const [textPagination, setTextPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  const [audioPagination, setAudioPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 8,
  });

  // Separate fetch functions
  const fetchTextStories = async (
    page: number = textPagination.currentPage
  ) => {
    try {
      setIsLoadingText(true);
      const response = await storiesAPI.getStories({
        type: "TEXT",
        limit: textPagination.itemsPerPage,
        page,
      });

      setTextStories(response.data?.data || []);
      setTextPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: response.data?.pagination?.pages || 1,
        totalItems: response.data?.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching text stories:", error);
    } finally {
      setIsLoadingText(false);
    }
  };

  const onClickTrendingCard = (story: Story) => {
    window.open(story?.affiliate?.targetUrl, "_blank", "noopener,");
    router.push(`/stories/${story.slug}?from=home`);
  };

  const fetchAudioStories = async (
    page: number = audioPagination.currentPage
  ) => {
    try {
      setIsLoadingAudio(true);
      const response = await storiesAPI.getStories({
        type: "AUDIO",
        limit: audioPagination.itemsPerPage,
        page,
      });

      setAudioStories(response.data?.data || []);
      setAudioPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalPages: response.data?.pagination?.pages || 1,
        totalItems: response.data?.pagination?.total || 0,
      }));
    } catch (error) {
      console.error("Error fetching audio stories:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const fetchTrendingStories = async () => {
    try {
      setIsLoadingTrending(true);
      const response = await storiesAPI.getStories({
        sort: "viewCount",
        limit: 6,
      });
      setTrendingStories(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching trending stories:", error);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const fetchRecentStories = async () => {
    try {
      setIsLoadingRecent(true);
      const response = await storiesAPI.getStories({
        sort: "updatedAt",
        limit: 8,
      });
      setRecentStories(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching recent stories:", error);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTextStories();
    fetchAudioStories();
    fetchTrendingStories();
    fetchRecentStories();
  }, []);

  // Page change handlers - no auto scroll
  const handleTextPageChange = (page: number) => {
    fetchTextStories(page);
  };

  const handleAudioPageChange = (page: number) => {
    fetchAudioStories(page);
  };

  // Show initial loading only if all sections are loading
  const isInitialLoading =
    isLoadingText && isLoadingAudio && isLoadingTrending && isLoadingRecent;

  if (isInitialLoading) {
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
          {/* Audio Stories Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
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

            {isLoadingAudio ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
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
            ) : audioStories.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {audioStories.map((story) => (
                    <StoryCard key={story.id} story={story} variant="card" />
                  ))}
                </div>
                <Pagination
                  currentPage={audioPagination.currentPage}
                  totalPages={audioPagination.totalPages}
                  totalItems={audioPagination.totalItems}
                  itemsPerPage={audioPagination.itemsPerPage}
                  onPageChange={handleAudioPageChange}
                  className="animate-slide-up animation-delay-500"
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">🎧</div>
                <p className="text-gray-600 dark:text-gray-400">
                  Chưa có truyện audio nào.
                </p>
              </div>
            )}
          </section>

          {/* Text Stories Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
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

            {isLoadingText ? (
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
            ) : textStories.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {textStories.map((story) => (
                    <StoryCard key={story.id} story={story} variant="card" />
                  ))}
                </div>
                <Pagination
                  currentPage={textPagination.currentPage}
                  totalPages={textPagination.totalPages}
                  totalItems={textPagination.totalItems}
                  itemsPerPage={textPagination.itemsPerPage}
                  onPageChange={handleTextPageChange}
                  className="animate-slide-up animation-delay-500"
                />
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

          {/* Recently Updated Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                🆕 <span className="ml-2">{t("home.featured.recent")}</span>
              </h2>
            </div>

            {isLoadingRecent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse"
                  >
                    <div className="flex space-x-4 p-4">
                      <div className="w-16 h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentStories.length > 0 ? (
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

              {isLoadingTrending ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-12 h-16 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingStories.length > 0 ? (
                <div className="space-y-4">
                  {trendingStories.map((story, index) => (
                    <div
                      key={story.id}
                      onClick={() => onClickTrendingCard(story)}
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
                              src={getMediaUrl(story.thumbnailUrl)}
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
                    </div>
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
