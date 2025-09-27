"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface SearchFilters {
  search: string;
  type: string;
  genre: string;
  status: string;
  sort: string;
  author: string;
}

interface StorySearchFormProps {
  onFiltersChange?: (filters: SearchFilters) => void;
  showAdminFilters?: boolean;
}

const StorySearchForm: React.FC<StorySearchFormProps> = ({
  onFiltersChange,
  showAdminFilters = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    type: "",
    genre: "",
    status: "",
    sort: "createdAt",
    author: "",
  });

  const [genres, setGenres] = useState<Genre[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize filters from search params and fetch genres
  useEffect(() => {
    fetchGenres();

    // Initialize filters from search params
    const newFilters = {
      search: searchParams?.get("search") || "",
      type: searchParams?.get("type") || "",
      genre: searchParams?.get("genre") || "",
      status: searchParams?.get("status") || "",
      sort: searchParams?.get("sort") || "createdAt",
      author: searchParams?.get("author") || "",
    };
    setFilters(newFilters);
  }, []);

  // Update filters when search params change
  useEffect(() => {
    if (searchParams) {
      const newFilters = {
        search: searchParams.get("search") || "",
        type: searchParams.get("type") || "",
        genre: searchParams.get("genre") || "",
        status: searchParams.get("status") || "",
        sort: searchParams.get("sort") || "createdAt",
        author: searchParams.get("author") || "",
      };
      setFilters(newFilters);
    }
  }, [searchParams]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/stories/genres");
      if (response.ok) {
        const data = await response.json();
        setGenres(data.genres || []);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);

    // Call parent callback if provided
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }

    // Update URL params
    updateUrlParams(newFilters);
  };

  const updateUrlParams = (newFilters: SearchFilters) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled in real-time via handleFilterChange
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {
      search: "",
      type: "",
      genre: "",
      status: "",
      sort: "createdAt",
      author: "",
    };
    setFilters(emptyFilters);

    if (onFiltersChange) {
      onFiltersChange(emptyFilters);
    }

    router.replace(window.location.pathname);
  };

  const activeFilterCount = Object.values(filters).filter(
    (value) => value && value !== "createdAt"
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm truyện theo tên, tác giả..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-2"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Story Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại truyện
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="TEXT">Truyện chữ</option>
                <option value="AUDIO">Truyện audio</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thể loại
              </label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả thể loại</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.slug}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (Admin only) */}
            {showAdminFilters && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PUBLISHED">Đã xuất bản</option>
                  <option value="HIDDEN">Ẩn</option>
                </select>
              </div>
            )}

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Mới nhất</option>
                <option value="updatedAt">Cập nhật gần đây</option>
                <option value="viewCount">Lượt xem</option>
                <option value="title">Tên A-Z</option>
                <option value="-title">Tên Z-A</option>
              </select>
            </div>
          </div>

          {/* Author Filter (Admin only) */}
          {showAdminFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tác giả
                </label>
                <input
                  type="text"
                  placeholder="Tìm theo tên tác giả..."
                  value={filters.author}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              Xóa bộ lọc
            </button>

            <div className="text-sm text-gray-500">
              {activeFilterCount > 0 &&
                `${activeFilterCount} bộ lọc đang áp dụng`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorySearchForm;
