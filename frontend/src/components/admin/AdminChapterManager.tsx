"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getMediaUrl } from "../../utils/media";
import apiClient from "@/utils/api";
import AdminChapterForm from "./AdminChapterForm";

interface Story {
  id: string;
  title: string;
  slug: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  content?: string;
  audioUrl?: string;
  isLocked: boolean;
  storyId: string;
  createdAt: string;
  updatedAt: string;
  story: Story;
  affiliate?: {
    id: string;
    provider: string;
    targetUrl: string;
    label?: string;
  };
}

interface SearchFilters {
  search: string;
  storyId: string;
  isLocked: string;
  hasAffiliate: string;
  sort: string;
}

const AdminChapterManager: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    storyId: "",
    isLocked: "",
    hasAffiliate: "",
    sort: "createdAt",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    fetchStories();
    fetchChapters();
  }, [filters, pagination.page]);

  const fetchStories = async () => {
    try {
      const response = await apiClient.get("/admin/stories?limit=1000");
      if (response.data?.success) {
        setStories(response.data.data.stories);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    }
  };

  const fetchChapters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        ),
      });

      const response = await apiClient.get(`/admin/chapters?${params}`);

      if (response.data?.success) {
        setChapters(response.data.data.chapters || []);
        setPagination((prev) => ({
          ...prev,
          ...response.data.data.pagination,
        }));
      }
    } catch (error) {
      console.error("Error fetching chapters:", error);
      toast.error("Không thể tải danh sách chương");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (chapter: Chapter) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chương "${chapter.title}"?`)) {
      return;
    }

    try {
      const loadingToast = toast.loading("Đang xóa chương...");

      const response = await apiClient.delete(`/admin/chapters/${chapter.id}`);

      if (response.status >= 200 && response.status < 300) {
        toast.success("Xóa chương thành công!", {
          id: loadingToast,
        });
        fetchChapters();
      } else {
        toast.error("Có lỗi xảy ra khi xóa chương", {
          id: loadingToast,
        });
      }
    } catch (error: any) {
      console.error("Error deleting chapter:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa chương"
      );
    }
  };

  const handleCreate = () => {
    setEditingChapter(null);
    setShowModal(true);
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingChapter(null);
  };

  const handleSuccess = () => {
    fetchChapters();
    handleCloseModal();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStoryTitle = (storyId: string) => {
    const story = stories.find((s) => s.id === storyId);
    return story?.title || "Không xác định";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý chương
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          + Tạo chương mới
        </button>
      </div>

      {/* Search and Filter Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tiêu đề chương..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Story Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Truyện
            </label>
            <select
              value={filters.storyId}
              onChange={(e) => handleFiltersChange({ storyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả truyện</option>
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title}
                </option>
              ))}
            </select>
          </div>

          {/* Lock Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái khóa
            </label>
            <select
              value={filters.isLocked}
              onChange={(e) =>
                handleFiltersChange({ isLocked: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Đã khóa</option>
              <option value="false">Không khóa</option>
            </select>
          </div>

          {/* Affiliate Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Affiliate Link
            </label>
            <select
              value={filters.hasAffiliate}
              onChange={(e) =>
                handleFiltersChange({ hasAffiliate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Có affiliate</option>
              <option value="false">Không có affiliate</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sắp xếp
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFiltersChange({ sort: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Mới nhất</option>
              <option value="updatedAt">Cập nhật gần đây</option>
              <option value="number">Số chương</option>
              <option value="title">Tiêu đề</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chapters Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  STT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chương
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Truyện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Affiliate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : chapters.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không tìm thấy chương nào
                  </td>
                </tr>
              ) : (
                chapters.map((chapter, index) => (
                  <tr
                    key={chapter.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Chương {chapter.number}: {chapter.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {chapter.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {chapter.story?.title || getStoryTitle(chapter.storyId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          chapter.isLocked
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {chapter.isLocked ? "🔒 Đã khóa" : "🔓 Mở"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {chapter.affiliate ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          🔗 {chapter.affiliate.provider}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                          -
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(chapter.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(chapter)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Chỉnh sửa chương"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(chapter)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Xóa chương"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                trong tổng số {pagination.total} chương
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Trang {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Create/Edit Chapter */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingChapter ? "Chỉnh sửa chương" : "Tạo chương mới"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
            <div className="p-6">
              <AdminChapterForm
                storyId={editingChapter?.storyId || null}
                chapter={
                  editingChapter
                    ? {
                        id: editingChapter.id,
                        number: editingChapter.number,
                        title: editingChapter.title,
                        content: editingChapter.content,
                        audioUrl: editingChapter.audioUrl,
                        isLocked: editingChapter.isLocked,
                        affiliateId: editingChapter.affiliate?.id,
                        storyId: editingChapter.storyId,
                      }
                    : undefined
                }
                onSuccess={handleSuccess}
                onCloseModal={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChapterManager;
