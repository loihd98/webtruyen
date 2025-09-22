"use client";

import React, { useState, useCallback } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "audio";
  size: number;
  uploadedAt: Date;
}

const AdminMediaUpload: React.FC = () => {
  const { t } = useLanguage();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFiles = useCallback(async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create mock uploaded file
      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + i,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'audio',
        size: file.size,
        uploadedAt: new Date(),
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
    }

    setIsUploading(false);
    setUploadProgress(0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

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

  const deleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    // Show toast notification (you can implement this)
    alert(t("admin.media.url_copied"));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <div className="text-4xl">
                📁
              </div>
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

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.media.uploaded_files")} ({uploadedFiles.length})
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-white text-3xl">🎵</div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                    </p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyUrl(file.url)}
                        className="flex-1 bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-3 py-1 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
                      >
                        {t("admin.media.copy_url")}
                      </button>
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-3 py-1 rounded text-xs hover:bg-red-100 dark:hover:bg-red-900/70 transition-colors"
                      >
                        {t("admin.media.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.media.management")}
          </h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t("admin.media.story_thumbnails")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("admin.media.thumbnail_description")}
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">🎧</div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t("admin.media.audio_covers")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("admin.media.audio_description")}
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t("admin.media.user_avatars")}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("admin.media.avatar_description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMediaUpload;