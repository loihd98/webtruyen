"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Story } from "../../types";
import apiClient from "@/utils/api";
import Modal from "./Modal";
import AdminStoryForm from "./AdminStoryForm";
import Pagination from "../../components/ui/Pagination";

// Loading component
const AdminStoriesLoading = () => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-300 dark:bg-gray-600 rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

const AdminStoryManager: React.FC = () => {
  const { t } = useLanguage();

  // State management
  const [stories, setStories] = useState<Story[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "PUBLISHED" | "DRAFT" | "HIDDEN" | ""
  >("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch stories function
  const fetchStories = async (page: number = currentPage) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (selectedStatus) {
        params.append("status", selectedStatus);
      }

      if (sortBy) {
        params.append("sort", sortBy);
      }

      const response = await apiClient.get(`/admin/stories?${params}`);
      console.log(response.data?.data, "Fetched admin stories data");

      setStories(response.data.data?.stories || []);
      setPagination(response.data?.data.pagination);
    } catch (error) {
      console.error("Error fetching admin stories:", error);
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

  // Fetch stories when filters change
  useEffect(() => {
    fetchStories(currentPage);
  }, [currentPage, selectedStatus, sortBy]);

  const handleDelete = async (storyId: string) => {
    if (window.confirm(t("admin.stories.confirm_delete"))) {
      try {
        await apiClient.delete(`/admin/stories/${storyId}`);
        setStories((prev) => prev.filter((story) => story.id !== storyId));
        // Show success message (you can add toast notification here)
        console.log("Story deleted successfully");
      } catch (error) {
        console.error("Error deleting story:", error);
        // Show error message (you can add toast notification here)
        alert(t("admin.stories.delete_error"));
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        text: t("common.published"),
      },
      DRAFT: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        text: t("common.draft"),
      },
      HIDDEN: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        text: t("common.hidden"),
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === "AUDIO" ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        🎧 {t("common.audio")}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        📖 {t("common.text")}
      </span>
    );
  };

  // Handler functions
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleStatusChange = (
    status: "PUBLISHED" | "DRAFT" | "HIDDEN" | ""
  ) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to page 1 when filtering
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1); // Reset to page 1 when sorting
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setSortBy("createdAt");
    setCurrentPage(1);
    fetchStories(1);
  };

  if (loading) {
    return <AdminStoriesLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.stories.title")}
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + {t("admin.stories.create_new")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <div>
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm truyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <button
                onClick={() => fetchStories(1)}
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg font-medium transition-colors duration-200 hover:shadow-lg"
              >
                Tìm
              </button>
            </form>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Trạng thái
              </label>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as "PUBLISHED" | "DRAFT" | "HIDDEN" | ""
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="">Tất cả</option>
                <option value="PUBLISHED">✅ Đã xuất bản</option>
                <option value="DRAFT">📝 Bản nháp</option>
                <option value="HIDDEN">🙈 Ẩn</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="createdAt">📅 Mới nhất</option>
                <option value="updatedAt">🔄 Cập nhật</option>
                <option value="title">🔤 Tên A-Z</option>
                <option value="viewCount">👁️ Xem nhiều</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                🗑️ Xóa bộ lọc
              </button>
            </div>

            {/* Refresh */}
            <div className="flex items-end">
              <button
                onClick={() => fetchStories(currentPage)}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
              >
                🔄 Làm mới
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedStatus || sortBy !== "createdAt") && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bộ lọc đang áp dụng:
              </span>
              {searchQuery && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                  🔍 "{searchQuery}"
                </span>
              )}
              {selectedStatus && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs">
                  {selectedStatus === "PUBLISHED"
                    ? "✅ Đã xuất bản"
                    : selectedStatus === "DRAFT"
                    ? "📝 Bản nháp"
                    : "🙈 Ẩn"}
                </span>
              )}
              {sortBy !== "createdAt" && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-xs">
                  🔄{" "}
                  {sortBy === "updatedAt"
                    ? "Cập nhật"
                    : sortBy === "title"
                    ? "Tên A-Z"
                    : "Xem nhiều"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.stories.story")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.author")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.type")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.stories.stats")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.stories.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {stories.map((story) => (
                <tr
                  key={story.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={
                          story.thumbnailUrl ||
                          "https://via.placeholder.com/60x80?text=No+Image"
                        }
                        alt={story.title}
                        className="h-16 w-12 object-cover rounded"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {story.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {story.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {story.author?.name || t("admin.stories.unknown_author")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(story.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(story.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-1">
                      <div>👁️ {story.viewCount.toLocaleString()}</div>
                      <div>📖 {story._count?.chapters || 0}</div>
                      <div>🔖 {story._count?.bookmarks || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingStory(story)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            className="animate-slide-up animation-delay-500"
          />
        </div>

        {stories?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedStatus
                ? "Không tìm thấy truyện nào phù hợp với bộ lọc"
                : "Chưa có truyện nào trong hệ thống"}
            </p>
            {(searchQuery || selectedStatus) && (
              <button
                onClick={clearFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Story"
        >
          <AdminStoryForm onCloseModal={() => setShowCreateModal(false)} />
        </Modal>

        {/* Edit Story Modal */}
        <Modal
          isOpen={!!editingStory}
          onClose={() => setEditingStory(null)}
          title="Edit Story"
        >
          {editingStory && (
            <AdminStoryForm
              storyId={editingStory.id}
              onCloseModal={() => setEditingStory(null)}
              onSuccess={() => {
                setEditingStory(null);
                fetchStories(currentPage);
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminStoryManager;
