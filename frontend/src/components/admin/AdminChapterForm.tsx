"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/api";
import { getMediaUrl } from "../../utils/media";
import Image from "next/image";

interface ChapterFormData {
  number: number;
  title: string;
  content?: string;
  audioUrl?: string;
  isLocked: boolean;
  thumbnailUrl?: string;
  duration?: number;
}

interface AdminChapterFormProps {
  storyId: string | null;
  chapter?: ChapterFormData;
  onSuccess?: () => void;
  onCloseModal?: () => void;
}

const AdminChapterForm: React.FC<AdminChapterFormProps> = ({
  storyId,
  chapter,
  onSuccess,
  onCloseModal,
}) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ChapterFormData>(
    chapter || {
      number: 1,
      title: "",
      content: "",
      audioUrl: "",
      isLocked: false,
      thumbnailUrl: "",
      duration: undefined,
    }
  );
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadFile = async (
    file: File,
    type: "image" | "audio"
  ): Promise<string> => {
    const fileKey = type === "audio" ? "audio" : "image";
    const form = new FormData();
    form.append(fileKey, file);
    const response = await apiClient.post(`media/upload/${type}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.file.url;
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File hình ảnh không được vượt quá 5MB");
      return;
    }
    try {
      setUploading(true);
      setError("");
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      const filename = await uploadFile(file, "image");
      setFormData((prev) => ({ ...prev, thumbnailUrl: filename }));
    } catch {
      setError("Có lỗi khi upload hình ảnh");
      setThumbnailPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Vui lòng chọn file audio");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File audio không được vượt quá 50MB");
      return;
    }
    try {
      setUploading(true);
      setError("");
      setAudioPreview(URL.createObjectURL(file));
      const filename = await uploadFile(file, "audio");
      setFormData((prev) => ({ ...prev, audioUrl: filename }));
    } catch {
      setError("Có lỗi khi upload audio");
      setAudioPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tiêu đề chương");
      return;
    }
    if (!formData.content?.trim()) {
      setError("Vui lòng nhập nội dung chương");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const url = chapter
        ? `/admin/chapters/${chapter?.number}`
        : `/admin/stories/${storyId}/chapters`;
      const method = chapter ? "put" : "post";
      const response = await apiClient[method](url, formData);
      if (response.status >= 200 && response.status < 300) {
        setSuccess(
          chapter ? "Cập nhật chương thành công!" : "Tạo chương thành công!"
        );
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi khi lưu chương");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">
        {chapter ? "Chỉnh sửa chương" : "Tạo chương mới"}
      </h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Số chương *
            </label>
            <input
              type="number"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isLocked"
              checked={formData.isLocked}
              onChange={handleInputChange}
              className="h-4 w-4"
            />
            <label className="text-sm">Khóa chương này</label>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Ảnh thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="w-full px-3 py-2 border rounded-md"
            />
            {thumbnailPreview && (
              <div className="mt-2">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  width={160}
                  height={200}
                  className="rounded object-cover"
                />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">File audio</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="w-full px-3 py-2 border rounded-md"
            />
            {audioPreview && (
              <div className="mt-2">
                <audio controls className="w-full">
                  <source src={audioPreview} />
                  Trình duyệt không hỗ trợ phát audio.
                </audio>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Thời lượng (giây)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              min={0}
            />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 mt-4">
          Nội dung *
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          rows={8}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCloseModal || (() => router.back())}
          className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : chapter ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
};

export default AdminChapterForm;
