"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Comment, User } from "../../types";
import { adminAPI } from "../../utils/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FaSearch,
  FaFilter,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaUserCircle,
  FaSpinner,
  FaChevronDown,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle,
} from "react-icons/fa";

interface AdminCommentManagerProps {
  className?: string;
}

interface CommentWithRelations {
  id: string;
  content: string;
  isApproved: boolean;
  userId: string;
  chapterId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  chapter: {
    id: string;
    title: string;
    story: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

interface CommentFilters {
  search: string;
  status: "all" | "approved" | "pending";
  sortBy: "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
}

const AdminCommentManager: React.FC<AdminCommentManagerProps> = ({
  className = "",
}) => {
  const [comments, setComments] = useState<CommentWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filters, setFilters] = useState<CommentFilters>({
    search: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  // Load comments
  const loadComments = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAPI.getComments(pageNum, 20);

      if (response.data) {
        setComments(response.data.data as CommentWithRelations[]);
        setPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.pages);
        setTotalComments(response.data.pagination.total);
      }
    } catch (err: any) {
      console.error("Error loading comments:", err);
      setError("Không thể tải danh sách bình luận");
    } finally {
      setLoading(false);
    }
  };

  // Delete single comment
  const deleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      setActionLoading(commentId);
      await adminAPI.deleteComment(commentId);

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotalComments((prev) => prev - 1);

      alert("Đã xóa bình luận thành công");
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Có lỗi xảy ra khi xóa bình luận");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete multiple comments
  const deleteSelectedComments = async () => {
    if (selectedComments.length === 0) return;

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedComments.length} bình luận đã chọn?`
      )
    )
      return;

    try {
      setActionLoading("bulk-delete");

      // Delete comments one by one (or implement bulk delete API)
      await Promise.all(
        selectedComments.map((id) => adminAPI.deleteComment(id))
      );

      setComments((prev) =>
        prev.filter((c) => !selectedComments.includes(c.id))
      );
      setTotalComments((prev) => prev - selectedComments.length);
      setSelectedComments([]);

      alert(`Đã xóa ${selectedComments.length} bình luận thành công`);
    } catch (error) {
      console.error("Error deleting comments:", error);
      alert("Có lỗi xảy ra khi xóa bình luận");
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle comment selection
  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  // Select all comments
  const toggleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map((c) => c.id));
    }
  };

  // Handle filter change
  const handleFilterChange = (key: keyof CommentFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  // Apply filters (in real app, this would be server-side)
  const filteredComments = comments.filter((comment) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesContent = comment.content
        .toLowerCase()
        .includes(searchLower);
      const matchesUser = comment.user?.name
        ?.toLowerCase()
        .includes(searchLower);
      const matchesStory = comment.chapter?.story?.title
        ?.toLowerCase()
        .includes(searchLower);

      if (!matchesContent && !matchesUser && !matchesStory) {
        return false;
      }
    }

    if (filters.status !== "all") {
      if (filters.status === "approved" && !comment.isApproved) return false;
      if (filters.status === "pending" && comment.isApproved) return false;
    }

    return true;
  });

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    const aValue = new Date(a[filters.sortBy]).getTime();
    const bValue = new Date(b[filters.sortBy]).getTime();

    return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  // Load comments on mount
  useEffect(() => {
    if (isAdmin) {
      loadComments();
    }
  }, [isAdmin]);

  // Reload when page changes
  useEffect(() => {
    if (isAdmin && page > 1) {
      loadComments(page);
    }
  }, [page]);

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
        <p className="text-red-600">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  return (
    <div className={`admin-comment-manager ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý bình luận
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tổng cộng: {totalComments} bình luận
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FaFilter className="w-4 h-4" />
            Lọc
            <FaChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {selectedComments.length > 0 && (
            <button
              onClick={deleteSelectedComments}
              disabled={actionLoading === "bulk-delete"}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors"
            >
              {actionLoading === "bulk-delete" ? (
                <FaSpinner className="w-4 h-4 animate-spin" />
              ) : (
                <FaTrash className="w-4 h-4" />
              )}
              Xóa ({selectedComments.length})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Nội dung, tác giả, truyện..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="updatedAt">Ngày cập nhật</option>
              </select>
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thứ tự
              </label>
              <button
                onClick={() =>
                  handleFilterChange(
                    "sortOrder",
                    filters.sortOrder === "asc" ? "desc" : "asc"
                  )
                }
                className="flex items-center gap-2 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {filters.sortOrder === "asc" ? (
                  <>
                    <FaSortUp className="w-4 h-4" />
                    Tăng dần
                  </>
                ) : (
                  <>
                    <FaSortDown className="w-4 h-4" />
                    Giảm dần
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-gray-400 text-xl mr-2" />
            <span className="text-gray-600 dark:text-gray-400">
              Đang tải bình luận...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => loadComments()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="text-center py-12">
            <FaEye className="text-gray-300 dark:text-gray-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Không có bình luận nào
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="border-b border-gray-200 dark:border-gray-600 p-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={
                    selectedComments.length === comments.length &&
                    comments.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chọn tất cả ({sortedComments.length})
                </span>
              </div>
            </div>

            {/* Comments list */}
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {sortedComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedComments.includes(comment.id)}
                      onChange={() => toggleCommentSelection(comment.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />

                    {/* Comment content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {/* User avatar */}
                          {comment.user?.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt={comment.user.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <FaUserCircle className="w-8 h-8 text-gray-400 flex-shrink-0" />
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {comment.user?.name || "Người dùng"}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  comment.isApproved
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                }`}
                              >
                                {comment.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(
                                new Date(comment.createdAt),
                                {
                                  addSuffix: true,
                                  locale: vi,
                                }
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={() => deleteComment(comment.id)}
                          disabled={actionLoading === comment.id}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa bình luận"
                        >
                          {actionLoading === comment.id ? (
                            <FaSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            <FaTrash className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Comment text */}
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-2">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      {/* Story info */}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>Truyện: </span>
                        <a
                          href={`/stories/${comment.chapter?.story?.slug}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {comment.chapter?.story?.title}
                        </a>
                        <span className="mx-2">•</span>
                        <span>Chương: {comment.chapter?.title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 dark:border-gray-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Trang {page} / {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCommentManager;
