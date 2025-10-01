"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import apiClient from "@/utils/api";
import Modal from "./Modal";

interface AffiliateLink {
  id: string;
  provider: string;
  targetUrl: string;
  label?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stories: number;
    chapters: number;
  };
}

interface AffiliateLinkFormData {
  provider: string;
  targetUrl: string;
  label: string;
  description: string;
  isActive: boolean;
}

const AdminAffiliateLinkManager: React.FC = () => {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvider, setFilterProvider] = useState("");
  const [filterActive, setFilterActive] = useState<string>("ALL");
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState<AffiliateLinkFormData>({
    provider: "",
    targetUrl: "",
    label: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchAffiliateLinks();
  }, [currentPage, searchTerm, filterProvider, filterActive]);

  const fetchAffiliateLinks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterProvider) params.append("provider", filterProvider);
      if (filterActive !== "ALL")
        params.append("isActive", filterActive === "ACTIVE" ? "true" : "false");

      const response = await apiClient.get(`/admin/affiliate-links?${params}`);

      if (response.data?.success) {
        setAffiliateLinks(response.data.data.affiliateLinks || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching affiliate links:", error);
      toast.error("Không thể tải danh sách affiliate links");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.provider.trim() || !formData.targetUrl.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    const loadingToast = toast.loading(
      editingLink ? "Cập nhật affiliate link..." : "Tạo affiliate link mới..."
    );

    try {
      setFormLoading(true);

      if (editingLink) {
        await apiClient.patch(
          `/admin/affiliate-links/${editingLink.id}`,
          formData
        );
        toast.success("Cập nhật affiliate link thành công!", {
          id: loadingToast,
        });
      } else {
        await apiClient.post("/admin/affiliate-links", formData);
        toast.success("Tạo affiliate link thành công!", { id: loadingToast });
      }

      handleCloseModal();
      fetchAffiliateLinks();
    } catch (error: any) {
      console.error("Error saving affiliate link:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra", {
        id: loadingToast,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLink(null);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (link: AffiliateLink) => {
    setEditingLink(link);
    setFormData({
      provider: link.provider,
      targetUrl: link.targetUrl,
      label: link.label || "",
      description: link.description || "",
      isActive: link.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (link: AffiliateLink) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa affiliate link "${link.provider}"?`
      )
    ) {
      return;
    }

    const loadingToast = toast.loading("Xóa affiliate link...");

    try {
      await apiClient.delete(`/admin/affiliate-links/${link.id}`);
      toast.success("Xóa affiliate link thành công!", { id: loadingToast });
      fetchAffiliateLinks();
    } catch (error: any) {
      console.error("Error deleting affiliate link:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa", {
        id: loadingToast,
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLink(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      provider: "",
      targetUrl: "",
      label: "",
      description: "",
      isActive: true,
    });
  };

  const getProviderBadge = (provider: string) => {
    const colors: Record<string, string> = {
      "Google Drive":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Fshare:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Mega: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Mediafire:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          colors[provider] ||
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        }`}
      >
        {provider}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-300 dark:bg-gray-600 rounded"
                ></div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Quản lý Affiliate Links
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          + Tạo affiliate link mới
        </button>
      </div>

      {/* Search and Filter Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Nhà cung cấp, nhãn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Provider Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nhà cung cấp
            </label>
            <input
              type="text"
              placeholder="Lọc theo nhà cung cấp..."
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Tạm dừng</option>
            </select>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={fetchAffiliateLinks}
              className="w-full bg-gray-600 hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Affiliate Links Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  STT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nhà cung cấp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nhãn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sử dụng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {!isLoading &&
                affiliateLinks.length > 0 &&
                affiliateLinks.map((link, index) => (
                  <tr
                    key={link.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {(currentPage - 1) * 10 + index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {getProviderBadge(link.provider)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        <a
                          href={link.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {link.targetUrl}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {link.label || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          link.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {link.isActive ? "Hoạt động" : "Tạm dừng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        <div>📖 {link._count?.stories || 0} truyện</div>
                        <div>📑 {link._count?.chapters || 0} chương</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Chỉnh sửa"
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
                          onClick={() => handleDelete(link)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Xóa"
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
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị {(currentPage - 1) * 10 + 1} đến{" "}
                {Math.min(currentPage * 10, affiliateLinks.length)} của{" "}
                {affiliateLinks.length} kết quả
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage <= 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Tiếp
                </button>
              </div>
            </div>
          </div>
        )}

        {affiliateLinks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🔗</div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterProvider || filterActive !== "ALL"
                ? "Không tìm thấy affiliate link nào"
                : "Chưa có affiliate link nào"}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          editingLink ? "Chỉnh sửa Affiliate Link" : "Tạo Affiliate Link mới"
        }
        footer={
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="affiliate-form"
              disabled={formLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formLoading ? "Lưu..." : editingLink ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        }
      >
        <form id="affiliate-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nhà cung cấp *
            </label>
            <input
              type="text"
              value={formData.provider}
              onChange={(e) =>
                setFormData({ ...formData, provider: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Ví dụ: Google Drive, Fshare, Mega..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL *
            </label>
            <input
              type="url"
              value={formData.targetUrl}
              onChange={(e) =>
                setFormData({ ...formData, targetUrl: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/link"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nhãn hiển thị
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhãn hiển thị cho link"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Mô tả về affiliate link này..."
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="isActive"
                className="font-medium text-gray-700 dark:text-gray-300"
              >
                Kích hoạt
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                Link sẽ hiển thị và có thể sử dụng
              </p>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminAffiliateLinkManager;
