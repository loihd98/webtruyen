"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import apiClient from "@/utils/api";

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

interface SearchFilters {
  search: string;
  provider: string;
  isActive: string;
  sort: string;
}

interface AffiliateFormData {
  provider: string;
  targetUrl: string;
  label: string;
  description: string;
  isActive: boolean;
}

const AdminAffiliatePage: React.FC = () => {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    provider: "",
    isActive: "",
    sort: "createdAt",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [editingAffiliate, setEditingAffiliate] =
    useState<AffiliateLink | null>(null);
  const [formData, setFormData] = useState<AffiliateFormData>({
    provider: "",
    targetUrl: "",
    label: "",
    description: "",
    isActive: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAffiliateLinks();
  }, [filters, pagination.page]);

  const fetchAffiliateLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value)
        ),
      });

      const response = await apiClient.get(`/admin/affiliate-links?${params}`);

      if (response.data?.success) {
        setAffiliateLinks(response.data.data.affiliateLinks || []);
        setPagination((prev) => ({
          ...prev,
          ...response.data.data.pagination,
        }));
      }
    } catch (error) {
      console.error("Error fetching affiliate links:", error);
      toast.error("Không thể tải danh sách affiliate links");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (affiliate: AffiliateLink) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa affiliate link "${affiliate.provider}"?`
      )
    ) {
      return;
    }

    try {
      const loadingToast = toast.loading("Đang xóa affiliate link...");

      const response = await apiClient.delete(
        `/admin/affiliate-links/${affiliate.id}`
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Xóa affiliate link thành công!", {
          id: loadingToast,
        });
        fetchAffiliateLinks();
      } else {
        toast.error("Có lỗi xảy ra khi xóa affiliate link", {
          id: loadingToast,
        });
      }
    } catch (error: any) {
      console.error("Error deleting affiliate link:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa affiliate link"
      );
    }
  };

  const handleCreate = () => {
    setEditingAffiliate(null);
    setFormData({
      provider: "",
      targetUrl: "",
      label: "",
      description: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (affiliate: AffiliateLink) => {
    setEditingAffiliate(affiliate);
    setFormData({
      provider: affiliate.provider,
      targetUrl: affiliate.targetUrl,
      label: affiliate.label || "",
      description: affiliate.description || "",
      isActive: affiliate.isActive,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAffiliate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.provider.trim()) {
      toast.error("Vui lòng nhập tên nhà cung cấp");
      return;
    }

    if (!formData.targetUrl.trim()) {
      toast.error("Vui lòng nhập URL đích");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.targetUrl);
    } catch {
      toast.error("Vui lòng nhập URL hợp lệ");
      return;
    }

    try {
      setFormLoading(true);

      const url = editingAffiliate
        ? `/admin/affiliate-links/${editingAffiliate.id}`
        : "/admin/affiliate-links";

      const method = editingAffiliate ? "patch" : "post";

      const response = await apiClient[method](url, formData);

      if (response.status >= 200 && response.status < 300) {
        const successMessage = editingAffiliate
          ? "Cập nhật affiliate link thành công!"
          : "Tạo affiliate link thành công!";

        toast.success(successMessage);
        fetchAffiliateLinks();
        handleCloseModal();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi lưu affiliate link";
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getProviderOptions = () => {
    const providers = Array.from(
      new Set(affiliateLinks.map((link) => link.provider))
    );
    return providers;
  };

  return (
    <div className="p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Provider, label, mô tả..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Provider Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nhà cung cấp
            </label>
            <select
              value={filters.provider}
              onChange={(e) =>
                handleFiltersChange({ provider: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả providers</option>
              {getProviderOptions().map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.isActive}
              onChange={(e) =>
                handleFiltersChange({ isActive: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã tắt</option>
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
              <option value="provider">Nhà cung cấp</option>
              <option value="usage">Sử dụng nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Affiliate Links Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  STT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Affiliate Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sử dụng
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
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : affiliateLinks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    Không tìm thấy affiliate link nào
                  </td>
                </tr>
              ) : (
                affiliateLinks.map((affiliate, index) => (
                  <tr
                    key={affiliate.id}
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
                            {affiliate.provider}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {affiliate.label || "Không có label"}
                          </div>
                          {affiliate.description && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs truncate">
                              {affiliate.description}
                            </div>
                          )}
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 max-w-xs truncate">
                            {affiliate.targetUrl}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          affiliate.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {affiliate.isActive ? "🟢 Hoạt động" : "🔴 Đã tắt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>Truyện: {affiliate._count?.stories || 0}</div>
                      <div>Chương: {affiliate._count?.chapters || 0}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Tổng:{" "}
                        {(affiliate._count?.stories || 0) +
                          (affiliate._count?.chapters || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(affiliate.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(affiliate)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Chỉnh sửa affiliate link"
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
                          onClick={() => handleDelete(affiliate)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Xóa affiliate link"
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
                trong tổng số {pagination.total} affiliate links
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

      {/* Modal for Create/Edit Affiliate Link */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingAffiliate
                  ? "Chỉnh sửa Affiliate Link"
                  : "Tạo Affiliate Link mới"}
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
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nhà cung cấp *
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Google Drive, Mega, MediaFire..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Target URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL đích *
                  </label>
                  <input
                    type="url"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/download"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nhãn hiển thị
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Tải về miễn phí, Download Full..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về affiliate link này..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Kích hoạt affiliate link
                    </span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang lưu...
                      </div>
                    ) : editingAffiliate ? (
                      "Cập nhật"
                    ) : (
                      "Tạo mới"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAffiliatePage;
