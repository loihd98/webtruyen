"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoryCard from "../../components/stories/StoryCard";
import { Story } from "../../types";

interface StoriesClientProps {
  initialStories: Story[];
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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(
    (searchParams.search as string) || ""
  );
  const [selectedType, setSelectedType] = useState<"TEXT" | "AUDIO" | "">(
    (searchParams.type as "TEXT" | "AUDIO") || ""
  );

  const currentPage = Number(searchParams.page) || 1;
  const totalPages = initialPagination.pages;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchQuery, type: selectedType, page: "1" });
  };

  const handleTypeChange = (type: "TEXT" | "AUDIO" | "") => {
    setSelectedType(type);
    updateURL({ search: searchQuery, type, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateURL({
      search: searchQuery,
      type: selectedType,
      page: page.toString(),
    });
  };

  const updateURL = (params: {
    search?: string;
    type?: string;
    page?: string;
  }) => {
    const url = new URLSearchParams();

    if (params.search && params.search.trim()) {
      url.set("search", params.search.trim());
    }

    if (params.type) {
      url.set("type", params.type);
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
    router.push("/stories");
  };

  return (
    <div className="space-y-8">
      {/* Filters with animation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-slide-up animation-delay-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Tìm kiếm truyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg font-medium transition-colors duration-200 hover:shadow-lg"
              >
                🔍
              </button>
            </form>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) =>
                handleTypeChange(e.target.value as "TEXT" | "AUDIO" | "")
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            >
              <option value="">Tất cả loại</option>
              <option value="TEXT">Truyện chữ</option>
              <option value="AUDIO">Truyện audio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      {initialStories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {initialStories.map((story, index) => (
              <div
                key={story.id}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StoryCard story={story} />
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
