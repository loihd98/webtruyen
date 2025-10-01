"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/utils/api";

interface Genre {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  _count?: {
    stories: number;
  };
}

interface AdminGenreFormProps {
  genre?: Genre;
  onSuccess: () => void;
  onCancel: () => void;
}

const AdminGenreForm: React.FC<AdminGenreFormProps> = ({
  genre,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (genre) {
      setFormData({
        name: genre.name,
      });
    }
  }, [genre]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên thể loại là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên thể loại phải có ít nhất 2 ký tự";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Tên thể loại không được vượt quá 50 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
      };

      if (genre) {
        // Update existing genre
        await apiClient.patch(`/admin/genres/${genre.id}`, payload);
        toast.success("Cập nhật thể loại thành công!");
      } else {
        // Create new genre
        await apiClient.post("/admin/genres", payload);
        toast.success("Tạo thể loại thành công!");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Genre form error:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi lưu thể loại";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {genre ? "Chỉnh sửa thể loại" : "Tạo thể loại mới"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Tên thể loại <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên thể loại..."
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              errors.name ? "border-red-500" : ""
            }`}
            maxLength={50}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Slug sẽ được tự động tạo từ tên thể loại
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {genre ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminGenreForm;
