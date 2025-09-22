"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import StoryCard from "../../components/stories/StoryCard";
import { Story, Genre } from "../../types";

interface EnhancedStoriesClientProps {
  initialStories: Story[];
  initialPagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const EnhancedStoriesClient: React.FC<EnhancedStoriesClientProps> = ({
  initialStories,
  initialPagination,
  searchParams,
}) => {
  const { t } = useLanguage();
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  
  // State
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState((searchParams.search as string) || "");
  const [selectedType, setSelectedType] = useState<"TEXT" | "AUDIO" | "">(
    (searchParams.type as "TEXT" | "AUDIO") || ""
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.genres ? (searchParams.genres as string).split(",") : []
  );
  const [selectedStatus, setSelectedStatus] = useState<"PUBLISHED" | "DRAFT" | "">(
    (searchParams.status as "PUBLISHED" | "DRAFT") || ""
  );
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular" | "title" | "views">(
    (searchParams.sort as any) || "newest"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [minChapters, setMinChapters] = useState<string>(searchParams.minChapters as string || "");
  const [authorSearch, setAuthorSearch] = useState<string>(searchParams.author as string || "");

  // Mock genres data - replace with actual API call
  const [genres] = useState<Genre[]>([
    { id: "1", name: "Tu Tiên", slug: "tu-tien", createdAt: "", _count: { stories: 234 } },
    { id: "2", name: "Kiếm Hiệp", slug: "kiem-hiep", createdAt: "", _count: { stories: 189 } },
    { id: "3", name: "Đô Thị", slug: "do-thi", createdAt: "", _count: { stories: 156 } },
    { id: "4", name: "Huyền Huyễn", slug: "huyen-huyen", createdAt: "", _count: { stories: 298 } },
    { id: "5", name: "Dị Giới", slug: "di-gioi", createdAt: "", _count: { stories: 167 } },
    { id: "6", name: "Khoa Huyễn", slug: "khoa-huyen", createdAt: "", _count: { stories: 89 } },
    { id: "7", name: "Võng Du", slug: "vong-du", createdAt: "", _count: { stories: 123 } },
    { id: "8", name: "Lịch Sử", slug: "lich-su", createdAt: "", _count: { stories: 78 } },
  ]);

  const currentPage = Number(searchParams.page) || 1;
  const totalPages = pagination.pages;

  useEffect(() => {
    // Auto-search when filters change
    const timeoutId = setTimeout(() => {
      handleFilterChange();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedType, selectedGenres, selectedStatus, sortBy, minChapters, authorSearch]);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedType) params.set("type", selectedType);
    if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","));
    if (selectedStatus) params.set("status", selectedStatus);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (minChapters) params.set("minChapters", minChapters);
    if (authorSearch.trim()) params.set("author", authorSearch.trim());
    
    params.set("page", "1");

    const queryString = params.toString();
    router.push(`/stories${queryString ? `?${queryString}` : ""}`);
  };

  const handleGenreToggle = (genreSlug: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreSlug)
        ? prev.filter(g => g !== genreSlug)
        : [...prev, genreSlug]
    );
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", page.toString());
    router.push(`/stories?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSelectedGenres([]);
    setSelectedStatus("");
    setSortBy("newest");
    setMinChapters("");
    setAuthorSearch("");
    router.push("/stories");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedType) count++;
    if (selectedGenres.length > 0) count++;
    if (selectedStatus) count++;
    if (sortBy !== "newest") count++;
    if (minChapters) count++;
    if (authorSearch.trim()) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("stories.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t("stories.total_found")}: <span className="font-semibold">{pagination.total}</span> {t("stories.stories")}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <span>{t("stories.filters")}</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("stories.advanced_filters")}
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium"
            >
              {t("stories.clear_all")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("stories.search_title")}
              </label>
              <input
                type="text"
                placeholder={t("stories.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Author Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("stories.search_author")}
              </label>
              <input
                type="text"
                placeholder={t("stories.author_placeholder")}
                value={authorSearch}
                onChange={(e) => setAuthorSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("stories.type")}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t("stories.all_types")}</option>
                <option value="TEXT">📖 {t("stories.text_stories")}</option>
                <option value="AUDIO">🎧 {t("stories.audio_stories")}</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("stories.status")}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">{t("stories.all_statuses")}</option>
                <option value="PUBLISHED">{t("stories.published")}</option>
                <option value="DRAFT">{t("stories.draft")}</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("stories.sort_by")}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="newest">{t("stories.sort_newest")}</option>
                <option value="oldest">{t("stories.sort_oldest")}</option>
                <option value="popular">{t("stories.sort_popular")}</option>
                <option value="views">{t("stories.sort_views")}</option>
                <option value="title">{t("stories.sort_title")}</option>
              </select>
            </div>

            {/* Min Chapters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("stories.min_chapters")}
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={minChapters}
                onChange={(e) => setMinChapters(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Genres Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t("stories.genres")} ({selectedGenres.length} {t("stories.selected")})
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.slug)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre.slug)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {genre.name} ({genre._count?.stories || 0})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid/List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">{t("common.loading")}</span>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("stories.no_stories_found")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t("stories.try_different_filters")}
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t("stories.clear_filters")}
            </button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <img
                      src={story.thumbnailUrl || "https://via.placeholder.com/80x120?text=No+Image"}
                      alt={story.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {story.title}
                      </h3>
                      {story.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                          {story.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{story.author?.name}</span>
                        <span>👁️ {story.viewCount.toLocaleString()}</span>
                        <span>📖 {story._count?.chapters || 0}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          story.type === "AUDIO" 
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}>
                          {story.type === "AUDIO" ? "🎧 Audio" : "📖 Text"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← {t("common.previous")}
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("common.next")} →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedStoriesClient;