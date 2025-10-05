"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoryCard from "../../components/stories/StoryCard";
import { Story } from "../../types";
import apiClient from "@/utils/api";

interface StoriesClientProps {
  initialStories: any;
  initialPagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function StoriesClient({
  initialStories,
  initialPagination,
  searchParams,
}: StoriesClientProps) {
  console.log(JSON.stringify(initialStories));

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(
    (searchParams.search as string) || ""
  );
  const [selectedType, setSelectedType] = useState<"TEXT" | "AUDIO" | "">(
    (searchParams.type as "TEXT" | "AUDIO") || ""
  );
  const [selectedGenre, setSelectedGenre] = useState<string>(
    (searchParams.genre as string) || ""
  );
  const [sortBy, setSortBy] = useState<string>(
    (searchParams.sort as string) || "createdAt"
  );
  const [genres, setGenres] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);

  const currentPage = Number(searchParams.page) || 1;
  const totalPages = initialPagination.pages;

  // Fetch genres on component mount
  React.useEffect(() => {
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
      {initialStories?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialStories?.data?.map((story: any, index: number) => (
              <div
                key={story.id}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StoryCard story={story} variant="card" />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center animate-slide-up animation-delay-500">
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:cursor-not-allowed"
                >
                  Trước
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    handlePageChange(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
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
