"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/api";
import toast from "react-hot-toast";
import { getMediaUrl } from "../../utils/media";
import Image from "next/image";
import AffiliateLinkSelect from "./AffiliateLinkSelect";
import { MediaSelectModal } from "./AdminMediaManager";

interface ChapterFormData {
  id?: string;
  number: number;
  title: string;
  content?: string;
  audioUrl?: string;
  isLocked: boolean;
  thumbnailUrl?: string;
  duration?: number;
  affiliateId?: string;
  storyId?: string;
}

interface Story {
  id: string;
  title: string;
  slug: string;
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
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>(storyId || "");
  const [formData, setFormData] = useState<ChapterFormData>(
    chapter || {
      number: 1,
      title: "",
      content: "",
      audioUrl: "",
      isLocked: false,
      thumbnailUrl: "",
      duration: undefined,
      affiliateId: "",
      storyId: storyId || "",
    }
  );
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showImageSelectModal, setShowImageSelectModal] = useState(false);
  const [showAudioSelectModal, setShowAudioSelectModal] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<"audio" | "image">(
    "audio"
  );

  // Fetch stories if no storyId provided
  useEffect(() => {
    if (!storyId) {
      fetchStories();
    }
  }, [storyId]);

  const fetchStories = async () => {
    try {
      const response = await apiClient.get("/admin/stories?limit=1000");
      if (response.data?.success) {
        setStories(response.data.data.stories);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("Không thể tải danh sách truyện");
    }
  };

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
    if (file.size > 500 * 1024 * 1024) {
      setError("File audio không được vượt quá 500MB");
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

    const targetStoryId = selectedStoryId || storyId;
    if (!targetStoryId) {
      setError("Vui lòng chọn truyện");
      return;
    }

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
        ? `/admin/chapters/${chapter?.id || chapter?.number}`
        : `/admin/stories/${targetStoryId}/chapters`;
      const method = chapter ? "put" : "post";
      const response = await apiClient[method](url, formData);
      if (response.status >= 200 && response.status < 300) {
        const successMessage = chapter
          ? "Cập nhật chương thành công!"
          : "Tạo chương thành công!";
        toast.success(successMessage);
        if (onSuccess) onSuccess();
        if (onCloseModal) onCloseModal();
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Có lỗi khi lưu chương";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Media selection handlers
  const handleImageSelect = (media: any) => {
    setFormData((prev) => ({ ...prev, thumbnailUrl: media.url }));
    setThumbnailPreview(getMediaUrl(media.url));
    setShowImageSelectModal(false);
  };

  const handleAudioSelect = (media: any) => {
    setFormData((prev) => ({ ...prev, audioUrl: media.url }));
    setAudioPreview(getMediaUrl(media.url));
    setShowAudioSelectModal(false);
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
          {/* Story Selection - only show when creating new chapter without specified story */}
          {!storyId && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Chọn truyện *
              </label>
              <select
                value={selectedStoryId}
                onChange={(e) => setSelectedStoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Chọn truyện...</option>
                {stories.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {/* Affiliate Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Liên kết affiliate (tùy chọn)
            </label>
            <AffiliateLinkSelect
              value={formData.affiliateId}
              onChange={(affiliateId) =>
                setFormData((prev) => ({
                  ...prev,
                  affiliateId: affiliateId || "",
                }))
              }
              placeholder="Chọn affiliate link..."
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Người dùng sẽ được chuyển đến link này khi chuyển chương
            </p>
          </div>
          {/* Media Library Section with Tabs */}
          <div className="col-span-full">
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
              <div className="border-b border-gray-200 dark:border-gray-600">
                <nav className="-mb-px flex">
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("audio")}
                    className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeMediaTab === "audio"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    🎵 Audio Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab("image")}
                    className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeMediaTab === "image"
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    🖼️ image
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeMediaTab === "audio" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Audio File
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioChange}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAudioSelectModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          📁 Library
                        </button>
                      </div>
                      {audioPreview && (
                        <div className="mt-3">
                          <audio controls className="w-full">
                            <source src={audioPreview} />
                            Your browser does not support audio playback.
                          </audio>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration (seconds)
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min={0}
                        placeholder="Auto-detected or manual entry"
                      />
                    </div>
                  </div>
                )}

                {activeMediaTab === "image" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Thumbnail Image
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowImageSelectModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          📁 Library
                        </button>
                      </div>
                      {thumbnailPreview && (
                        <div className="mt-3">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            width={200}
                            height={250}
                            className="rounded-md object-cover border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {uploading && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md text-center">
                    <div className="animate-spin inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                    Uploading {activeMediaTab} file...
                  </div>
                )}
              </div>
            </div>
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

      {/* Media Selection Modals */}
      <MediaSelectModal
        isOpen={showImageSelectModal}
        onClose={() => setShowImageSelectModal(false)}
        onSelect={handleImageSelect}
        type="image"
        title="Chọn hình ảnh từ thư viện"
      />

      <MediaSelectModal
        isOpen={showAudioSelectModal}
        onClose={() => setShowAudioSelectModal(false)}
        onSelect={handleAudioSelect}
        type="audio"
        title="Chọn audio từ thư viện"
      />
    </form>
  );
};

export default AdminChapterForm;
