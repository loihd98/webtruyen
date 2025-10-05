"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import apiClient from "@/utils/api";
import Modal from "./Modal";
import Pagination from "./Pagination";
import { get } from "http";
import { getMediaUrl } from "@/utils/media";

interface MediaFile {
  name: string;
  path: string;
  size: number;
  type: "image" | "audio" | "document";
  uploadedAt: string;
  url: string;
}

const MediaManager: React.FC = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<
    "ALL" | "image" | "audio" | "document"
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);

      // Fetch both audio and image files from file system
      const [audioResponse, imageResponse] = await Promise.all([
        apiClient
          .get("/admin/media/files?type=audio&limit=1000")
          .catch(() => ({ data: { files: [] } })),
        apiClient
          .get("/admin/media/files?type=image&limit=1000")
          .catch(() => ({ data: { files: [] } })),
      ]);

      const audioFiles = audioResponse.data?.files || [];
      const imageFiles = imageResponse.data?.files || [];

      // Combine and format files
      const allFiles = [
        ...audioFiles.map((file: any) => ({
          name: file.filename,
          path: file.path,
          size: file.size,
          type: "audio" as const,
          uploadedAt: file.createdAt || file.modifiedAt,
          url: `/uploads/audio/${file.filename}`,
        })),
        ...imageFiles.map((file: any) => ({
          name: file.filename,
          path: file.path,
          size: file.size,
          type: "image" as const,
          uploadedAt: file.createdAt || file.modifiedAt,
          url: `/uploads/image/${file.filename}`,
        })),
      ];

      setFiles(allFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (file: any) => {
    if (window.confirm(t("admin.media.confirm_delete"))) {
      try {
        await apiClient.delete(`/admin/media/files/${file?.name}`, {
          params: { type: file?.type },
        });
        setFiles((prev) => prev.filter((f) => f.name !== file?.name));
        console.log("File deleted successfully");
      } catch (error) {
        console.error("Error deleting file:", error);
        alert(t("admin.media.delete_error"));
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(uploadFiles).forEach((file) => {
        formData.append("files", file);
      });

      await apiClient.post("/admin/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowUploadModal(false);
      setUploadFiles(null);
      fetchFiles(); // Refresh the file list
      console.log("Files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
      alert(t("admin.media.upload_error1"));
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = files.filter((file: any) => {
    const matchesSearch = file?.name
      ?.toLowerCase()
      ?.includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "audio":
        return "🎵";
      case "document":
        return "📄";
      default:
        return "📁";
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "audio":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "document":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-300 dark:bg-gray-600 rounded"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.media.title")}
            </h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📤 {t("admin.media.upload")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.media.search")}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("admin.media.search_placeholder")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.media.type")}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">{t("admin.media.filter.all")}</option>
                <option value="image">{t("admin.media.filter.image")}</option>
                <option value="audio">{t("admin.media.filter.audio")}</option>
                <option value="document">
                  {t("admin.media.filter.document")}
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchFiles}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 {t("admin.media.refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedFiles.map((file) => (
              <div
                key={file.path}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getFileTypeColor(
                      file.type
                    )}`}
                  >
                    {getFileIcon(file.type)} {file.type}
                  </span>
                  <button
                    onClick={() => handleDelete(file)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title={t("admin.media.delete")}
                  >
                    🗑️
                  </button>
                </div>

                {file.type === "image" && (
                  <div className="mb-3">
                    <img
                      src={getMediaUrl(file.url)}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}

                {file.type === "audio" && (
                  <div className="mb-3">
                    <audio controls className="w-full">
                      <source src={getMediaUrl(file.url)} />
                    </audio>
                  </div>
                )}

                <div className="space-y-1">
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(file.url)}
                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    📋 {t("admin.media.copy_url")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📁</div>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? t("admin.media.no_results")
                  : t("admin.media.no_files1")}
              </p>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title={t("admin.media.upload_files")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("admin.media.select_files1")}
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setUploadFiles(e.target.files)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              accept="image/*,audio/*,.pdf,.doc,.docx"
            />
          </div>

          {uploadFiles && uploadFiles.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {t("admin.media.selected_files")}: {uploadFiles.length}
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                {Array.from(uploadFiles).map((file, index) => (
                  <li key={index}>
                    {file.name} ({formatFileSize(file.size)})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              disabled={isUploading}
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadFiles || uploadFiles.length === 0 || isUploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading
                ? t("admin.media.uploading")
                : t("admin.media.upload")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MediaManager;
