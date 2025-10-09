"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoryCard from "../../components/stories/StoryCard";
import { Story } from "../../types";
import apiClient from "@/utils/api";

// Loading component
const StoriesLoading = () => (
  <div className="space-y-8">
    {/* Stories grid skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="aspect-[3/4] bg-gray-300 dark:bg-gray-600"></div>
          <div className="p-2">
            <div className="flex gap-1 mb-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-10"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function StoriesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [stories, setStories] = useState<Story[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedType, setSelectedType] = useState<"TEXT" | "AUDIO" | "">(
    (searchParams.get("type") as "TEXT" | "AUDIO") || ""
  );
  const [selectedGenre, setSelectedGenre] = useState<string>(
    searchParams.get("genre") || ""
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "createdAt"
  );
  const [genres, setGenres] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);

  const currentPage = Number(searchParams.get("page")) || 1;

  // Fetch stories function
  const fetchStories = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (
        selectedType &&
        (selectedType === "TEXT" || selectedType === "AUDIO")
      ) {
        params.append("type", selectedType);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (selectedGenre) {
        params.append("genre", selectedGenre);
      }

      if (sortBy) {
        params.append("sort", sortBy);
      }

      const response = await apiClient.get(`/stories?${params}`);
      console.log(response.data, "Fetched stories data");

      setStories(response.data.data?.data || []);
      setPagination(
        response.data.pagination
          ? response.data.pagination
          : {
              total: 0,
              pages: 0,
              page: 1,
              limit: 10,
            }
      );
    } catch (error) {
      console.error("Error fetching stories:", error);
      setStories([]);
      setPagination({
        total: 0,
        pages: 0,
        page: 1,
        limit: 10,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch stories when URL parameters change
  useEffect(() => {
    fetchStories(currentPage);
  }, [currentPage, selectedType, searchQuery, selectedGenre, sortBy]);

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await apiClient.get("/stories/genres");
        if (response.data) {
          setGenres(response.data.genres || []);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({
      search: searchQuery,
      type: selectedType,
      genre: selectedGenre,
      sort: sortBy,
      page: "1",
    });
  };

  const handleTypeChange = (type: "TEXT" | "AUDIO" | "") => {
    setSelectedType(type);
    updateURL({
      search: searchQuery,
      type,
      genre: selectedGenre,
      sort: sortBy,
      page: "1",
    });
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    updateURL({
      search: searchQuery,
      type: selectedType,
      genre,
      sort: sortBy,
      page: "1",
    });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL({
      search: searchQuery,
      type: selectedType,
      genre: selectedGenre,
      sort,
      page: "1",
    });
  };

  const handlePageChange = (page: number) => {
    updateURL({
      search: searchQuery,
      type: selectedType,
      genre: selectedGenre,
      sort: sortBy,
      page: page.toString(),
    });
  };

  // Generate pagination numbers with ellipsis
  const generatePaginationNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = pagination.pages;
    const current = currentPage;

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current <= 4) {
        // Show 1, 2, 3, 4, 5, ..., last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        // Show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push("...");
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const updateURL = (params: {
    search?: string;
    type?: string;
    genre?: string;
    sort?: string;
    page?: string;
  }) => {
    const url = new URLSearchParams();

    if (params.search && params.search.trim()) {
      url.set("search", params.search.trim());
    }

    if (params.type) {
      url.set("type", params.type);
    }

    if (params.genre) {
      url.set("genre", params.genre);
    }

    if (params.sort && params.sort !== "createdAt") {
      url.set("sort", params.sort);
    }

    if (params.page && params.page !== "1") {
      url.set("page", params.page);
    }

    const queryString = url.toString();
    router.push(`/stories${queryString ? `?${queryString}` : ""}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedGenre("");
    setSortBy("createdAt");
    router.push("/stories");
  };

  return (
    <div className="space-y-8">
      {/* Filters with animation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-slide-up animation-delay-300">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <form onSubmit={handleSearch} className="flex ">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm truyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg  bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg  font-medium transition-colors duration-200 hover:shadow-lg"
              >
                Tìm
              </button>
            </form>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div className="sm:block hidden">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Loại truyện
              </label>
              <select
                value={selectedType}
                onChange={(e) =>
                  handleTypeChange(e.target.value as "TEXT" | "AUDIO" | "")
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="">Tất cả</option>
                <option value="TEXT">📖 Truyện chữ</option>
                <option value="AUDIO">🎧 Truyện audio</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thể loại
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="">Tất cả thể loại</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.slug}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="sm:block hidden">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="createdAt">📅 Mới nhất</option>
                <option value="viewCount">👁️ Xem nhiều</option>
                <option value="title">🔤 Tên A-Z</option>
                <option value="updatedAt">🔄 Cập nhật</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className=" items-end sm:flex hidden">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                🗑️ Xóa bộ lọc
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery ||
            selectedType ||
            selectedGenre ||
            sortBy !== "createdAt") && (
            <div className="hidden sm:flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bộ lọc đang áp dụng:
              </span>
              {searchQuery && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                  🔍 "{searchQuery}"
                </span>
              )}
              {selectedType && (
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                  {selectedType === "TEXT"
                    ? "📖 Truyện chữ"
                    : "🎧 Truyện audio"}
                </span>
              )}
              {selectedGenre && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                  📚 {genres.find((g) => g.slug === selectedGenre)?.name}
                </span>
              )}
              {sortBy !== "createdAt" && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs">
                  🔄{" "}
                  {sortBy === "viewCount"
                    ? "Xem nhiều"
                    : sortBy === "title"
                    ? "Tên A-Z"
                    : "Cập nhật"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <StoriesLoading />
      ) : stories.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {stories.map((story: any, index: number) => (
              <div
                key={story.id}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StoryCard story={story} variant="card" />
              </div>
            ))}
          </div>

          {/* Pagination - Ant Design Style */}
          {pagination.pages > 1 && (
            <div className="flex flex-col items-center space-y-4 animate-slide-up animation-delay-500">
              {/* Pagination Controls */}
              <div className="flex items-center justify-center space-x-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 shadow-sm">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-8 h-8 rounded transition-all duration-200 ${
                    currentPage === 1
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                  title="Trang trước"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {generatePaginationNumbers().map((page, index) => (
                    <div key={index}>
                      {typeof page === "string" ? (
                        <span className="flex items-center justify-center w-8 h-8 text-gray-400 dark:text-gray-500 text-sm">
                          {page}
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`flex items-center justify-center w-8 h-8 rounded text-sm font-medium transition-all duration-200 ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-md"
                              : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  className={`flex items-center justify-center w-8 h-8 rounded transition-all duration-200 ${
                    currentPage === pagination.pages
                      ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                  title="Trang tiếp"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Pagination Info */}
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Hiển thị <span className="font-medium text-gray-700 dark:text-gray-300">{((currentPage - 1) * pagination.limit) + 1}</span> - <span className="font-medium text-gray-700 dark:text-gray-300">{Math.min(currentPage * pagination.limit, pagination.total)}</span> trong tổng số <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> kết quả
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || selectedType
              ? "Không tìm thấy truyện nào"
              : "Chưa có truyện"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedType
              ? "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc"
              : "Hiện tại chưa có truyện nào trong hệ thống"}
          </p>
          {(searchQuery || selectedType) && (
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  );
}
