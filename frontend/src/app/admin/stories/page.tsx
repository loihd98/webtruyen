"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StorySearchForm from "../../../components/stories/StorySearchForm";
import { getMediaUrl } from "../../../utils/media";
import { useAccessToken } from "../../../hooks/useAuth";
import apiClient from "@/utils/api";
import Layout from "@/components/layout/Layout";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

interface Story {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: "TEXT" | "AUDIO";
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  thumbnailUrl?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  genres: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    chapters: number;
    bookmarks: number;
  };
}

interface SearchFilters {
  search: string;
  type: string;
  genre: string;
  status: string;
  sort: string;
  author: string;
}

const AdminStoriesPage: React.FC = () => {
  const router = useRouter();
  const accessToken = useAccessToken();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    type: "",
    genre: "",
    status: "",
    sort: "createdAt",
    author: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchStories();
  }, [filters, pagination.page]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        ),
      });

      const response = await apiClient.get(`/stories/admin/stories?${params}`);

      if (response.data?.data) {
        setStories(response.data.data?.data || []);
        setPagination((prev) => ({
          ...prev,
          ...response.data.data.pagination,
        }));
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleDelete = async (story: Story) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa truyện "${story.title}"?`)) {
      return;
    }

    try {
      const response = await apiClient.delete(`/stories/${story.slug}`);

      if (response.data) {
        alert("Xóa truyện thành công!");
        fetchStories();
      } else {
        alert("Có lỗi xảy ra khi xóa truyện");
      }
    } catch (error) {
      console.error("Error deleting story:", error);
      alert("Có lỗi xảy ra khi xóa truyện");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: "bg-gray-100 text-gray-800", text: "Bản nháp" },
      PUBLISHED: { color: "bg-green-100 text-green-800", text: "Đã xuất bản" },
      HIDDEN: { color: "bg-red-100 text-red-800", text: "Ẩn" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      TEXT: { color: "bg-blue-100 text-blue-800", text: "Chữ" },
      AUDIO: { color: "bg-purple-100 text-purple-800", text: "Audio" },
    };

    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý truyện</h1>
        <Link
          href="/admin/stories/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Tạo truyện mới
        </Link>
      </div>

      {/* Search and Filter Form */}
      <Suspense
        fallback={
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-pulse h-16"></div>
        }
      >
        <StorySearchForm
          onFiltersChange={handleFiltersChange}
          showAdminFilters={true}
        />
      </Suspense>

      {/* Stories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Truyện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : stories.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không có truyện nào
                  </td>
                </tr>
              ) : (
                stories.map((story) => (
                  <tr key={story.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-8">
                          {story.thumbnailUrl ? (
                            <img
                              className="h-12 w-8 object-cover rounded"
                              src={getMediaUrl(story.thumbnailUrl)}
                              alt={story.title}
                            />
                          ) : (
                            <div className="h-12 w-8 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No img
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {story.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {story.author.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {story.genres.map((g) => g.name).join(", ")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(story.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(story.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>Lượt xem: {story.viewCount}</div>
                      <div>Chương: {story._count?.chapters || 0}</div>
                      <div>Bookmark: {story._count?.bookmarks || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(story.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin/stories/${story.slug}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(story)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
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
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} đến{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                của {pagination.total} kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm">
                  Trang {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Loading component
const AdminStoriesPageLoading = () => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
      <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
    </div>
    <div className="bg-white rounded-lg shadow-md p-4 mb-6 animate-pulse h-16"></div>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="h-96 bg-gray-100 animate-pulse"></div>
    </div>
  </div>
);

// Wrapped component with Suspense
const AdminStoriesPageWrapper = () => (
  <Suspense fallback={<AdminStoriesPageLoading />}>
    <AdminStoriesPage />
  </Suspense>
);

export default AdminStoriesPageWrapper;
