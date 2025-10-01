"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import Layout from "../layout/Layout";
import apiClient from "@/utils/api";
import { getMediaUrl } from "../../utils/media";
import Modal from "./Modal";
import Pagination from "./Pagination";
import Image from "next/image";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MediaSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaFile) => void;
  type?: "image" | "audio";
  title?: string;
}

const MediaSelectModal: React.FC<MediaSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  type,
  title = "Chọn Media",
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      searchMediaFiles();
    }
  }, [isOpen, searchTerm, type]);

  const searchMediaFiles = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/media/search", {
        params: {
          q: searchTerm,
          type,
          limit: 20,
        },
      });

      if (response.data.success) {
        setMediaFiles(response.data.data);
      }
    } catch (error) {
      console.error("Error searching media files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên file..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles.map((media) => (
                <div
                  key={media.id}
                  onClick={() => onSelect(media)}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {media.type === "image" ? (
                    <div className="aspect-square relative mb-2">
                      <Image
                        src={getMediaUrl(media.url)}
                        alt={media.originalName}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center mb-2">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {media.originalName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {formatFileSize(media.size)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const AdminMediaManager: React.FC = () => {
  const { t } = useLanguage();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMediaFiles();
  }, [currentPage, searchTerm, filterType]);

  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get("/media", {
        params: {
          page: currentPage,
          limit: 20,
          search: searchTerm,
          type: filterType !== "ALL" ? filterType : undefined,
        },
      });

      if (response.data.success) {
        setMediaFiles(response.data.data.mediaFiles);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching media files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      await apiClient.post("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      fetchMediaFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa file này?")) {
      try {
        await apiClient.delete(`/media/${id}`);
        fetchMediaFiles();
      } catch (error) {
        console.error("Error deleting media file:", error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-300 dark:bg-gray-600 rounded"
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
              Quản lý Media Files
            </h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Upload File
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên file..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại file
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">Tất cả</option>
                <option value="image">Hình ảnh</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchMediaFiles}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaFiles.map((media) => (
            <div
              key={media.id}
              className="group border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square relative">
                {media.type === "image" ? (
                  <Image
                    src={getMediaUrl(media.url)}
                    alt={media.originalName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-4xl">🎵</span>
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() =>
                      window.open(getMediaUrl(media.url), "_blank")
                    }
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                    title="Xem"
                  >
                    👁️
                  </button>
                  <button
                    onClick={() => handleDelete(media.id)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    title="Xóa"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {media.originalName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(media.size)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {media.type === "image" ? "🖼️ Hình ảnh" : "🎵 Audio"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {mediaFiles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📁</div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "Không tìm thấy file nào" : "Chưa có file nào"}
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload File"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn file
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              accept="image/*,audio/*"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hỗ trợ: Images (JPG, PNG, GIF, WebP) và Audio (MP3, WAV, AAC, M4A)
            </p>
          </div>

          {selectedFile && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <div className="text-sm">
                <strong>File đã chọn:</strong> {selectedFile.name}
              </div>
              <div className="text-xs text-gray-500">
                Kích thước: {formatFileSize(selectedFile.size)}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? "Đang upload..." : "Upload"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export { MediaSelectModal };
export default AdminMediaManager;
