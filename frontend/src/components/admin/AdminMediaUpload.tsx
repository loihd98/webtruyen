"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import apiClient from "../../utils/api";
import { getMediaUrl } from "../../utils/media";
import toast from "react-hot-toast";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: "image" | "audio";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminMediaUpload: React.FC = () => {
  const { t } = useLanguage();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"" | "image" | "audio">("");

  // Load media files on component mount
  useEffect(() => {
    fetchMediaFiles();
  }, [searchQuery, filterType]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(searchQuery && { search: searchQuery }),
        ...(filterType && { type: filterType }),
        limit: "50",
      });

      const response = await apiClient.get(`/media?${params}`);
      if (response.data?.success) {
        setMediaFiles(response.data.data.mediaFiles || []);
      }
    } catch (error) {
      console.error("Error fetching media files:", error);
      toast.error("Không thể tải danh sách media");
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = useCallback(async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type.startsWith("image/") ? "image" : "audio";

        // Create FormData for upload (use "image" field name for both types)
        const formData = new FormData();
        formData.append("image", file);

        // Update progress
        setUploadProgress(((i + 0.5) / files.length) * 100);

        // Upload to backend (use /media/upload to save to database)
        const response = await apiClient.post("/media/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data?.success) {
          toast.success(`Upload ${file.name} thành công!`);
        }

        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      // Refresh media files list
      await fetchMediaFiles();
      toast.success(`Upload ${files.length} file(s) thành công!`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi upload");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await apiClient.delete(`/media/${id}`);
      toast.success("Xóa file thành công!");
      await fetchMediaFiles(); // Refresh list
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa file"
      );
    }
  };

  const copyUrl = (url: string) => {
    const fullUrl = getMediaUrl(url);
    navigator.clipboard.writeText(fullUrl);
    toast.success(t("admin.media.url_copied"));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.media.upload_files")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("admin.media.upload_description")}
          </p>
        </div>

        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="text-4xl">📁</div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("admin.media.drag_drop")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.media.or_click_to_select")}
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
                  {t("admin.media.select_images")}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
                <label className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors">
                  {t("admin.media.select_audio")}
                  <input
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("admin.media.supported_formats")}
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("admin.media.uploading")}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm media files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as "" | "image" | "audio")
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả loại</option>
                <option value="image">Hình ảnh</option>
                <option value="audio">Audio</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Media Files */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Media Files ({mediaFiles.length})
          </h3>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Chưa có media files nào</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {file.type === "image" ? (
                    <img
                      src={getMediaUrl(file.url)}
                      alt={file.originalName}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-white text-3xl">🎵</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.originalName}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.createdAt).toLocaleDateString()}
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyUrl(file.url)}
                        className="flex-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1 rounded text-xs hover:bg-red-100 dark:hover:bg-red-900/70 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMediaUpload;
