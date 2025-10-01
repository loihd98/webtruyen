"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { RootState } from "../../store";
import { getMediaUrl } from "../../utils/media";
import apiClient from "@/utils/api";
import AffiliateLinkSelect from "./AffiliateLinkSelect";
import { MediaSelectModal } from "./AdminMediaManager";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface Affiliate {
  id: string;
  provider: string;
  targetUrl: string;
  label?: string;
}

interface ChapterFormData {
  number: number;
  title: string;
  content?: string;
  audioUrl?: string;
  isLocked: boolean;
}

interface StoryFormData {
  title: string;
  description: string;
  type: "TEXT" | "AUDIO";
  genreIds: string[];
  thumbnailUrl: string;
  audioUrl?: string;
  content?: string;
  affiliateId?: string;
  chapters?: ChapterFormData[];
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
}

interface AdminStoryFormProps {
  storyId?: string;
  onCloseModal?: () => void;
  onSuccess?: () => void;
}

const AdminStoryForm: React.FC<AdminStoryFormProps> = ({
  storyId,
  onCloseModal,
  onSuccess,
}) => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<StoryFormData>({
    title: "",
    description: "",
    type: "TEXT",
    genreIds: [],
    thumbnailUrl: "",
    audioUrl: "",
    content: "",
    affiliateId: "",
    status: "DRAFT",
  });

  const [genres, setGenres] = useState<Genre[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [audioPreview, setAudioPreview] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showImageSelectModal, setShowImageSelectModal] = useState(false);
  const [showAudioSelectModal, setShowAudioSelectModal] = useState(false);

  useEffect(() => {
    fetchGenres();
    fetchAffiliates();
    if (storyId) {
      fetchStoryData();
    }
  }, [storyId]);

  const fetchGenres = async () => {
    try {
      const response = await apiClient.get("/stories/genres");
      if (response.data) {
        setGenres(response.data.genres || []);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchAffiliates = async () => {
    try {
      const response = await apiClient.get("/admin/affiliate-links");
      if (response.data) {
        // Handle both old and new response formats
        const affiliateLinks =
          response.data.data?.affiliateLinks ||
          response.data.affiliateLinks ||
          [];
        setAffiliates(affiliateLinks);
      }
    } catch (error) {
      console.error("Error fetching affiliates:", error);
      toast.error("Không thể tải danh sách affiliate links");
    }
  };

  const fetchStoryData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/stories/${storyId}`);

      if (response.data.success) {
        const story = response.data.data.story;

        setFormData({
          title: story.title || "",
          description: story.description || "",
          type: story.type || "TEXT",
          genreIds: story.genres?.map((g: any) => g.id) || [],
          thumbnailUrl: story.thumbnailUrl || "",
          audioUrl: story.audioUrl || "",
          content: story.content || "",
          affiliateId: story.affiliateId || "",
          status: story.status || "DRAFT",
        });

        if (story.thumbnailUrl) {
          setThumbnailPreview(getMediaUrl(story.thumbnailUrl));
        }
        if (story.audioUrl) {
          setAudioPreview(getMediaUrl(story.audioUrl));
        }
      } else {
        setError("Không thể tải thông tin truyện");
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      setError("Có lỗi xảy ra khi tải thông tin truyện");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreChange = (genreId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      genreIds: checked
        ? [...prev.genreIds, genreId]
        : prev.genreIds.filter((id) => id !== genreId),
    }));
  };

  const uploadFile = async (
    file: File,
    type: "image" | "audio"
  ): Promise<string> => {
    const fileKey = type === "audio" ? "audio" : "image";
    console.log(file, "file");

    const formData = new FormData();
    formData.append(fileKey, file);

    const response = await apiClient.post(`media/upload/${type}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.file.url;
  };

  const handleThumbnailChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Vui lòng chọn file hình ảnh";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "File hình ảnh không được vượt quá 5MB";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setUploading(true);
      setError("");

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const filename = await uploadFile(file, "image");
      setFormData((prev) => ({ ...prev, thumbnailUrl: filename }));
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      setError("Có lỗi xảy ra khi upload hình ảnh");
      setThumbnailPreview("");
    } finally {
      setUploading(false);
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      const errorMsg = "Vui lòng chọn file audio";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      const errorMsg = "File audio không được vượt quá 50MB";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setUploading(true);
      setError("");

      // Show preview immediately
      setAudioPreview(URL.createObjectURL(file));

      // Upload file
      const filename = await uploadFile(file, "audio");
      setFormData((prev) => ({ ...prev, audioUrl: filename }));
    } catch (error) {
      console.error("Error uploading audio:", error);
      setError("Có lỗi xảy ra khi upload file audio");
      setAudioPreview("");
    } finally {
      setUploading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      const errorMsg = "Vui lòng nhập tiêu đề truyện";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (!formData.description.trim()) {
      const errorMsg = "Vui lòng nhập mô tả truyện";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (formData.genreIds.length === 0) {
      const errorMsg = "Vui lòng chọn ít nhất một thể loại";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (formData.type === "TEXT" && !formData.content?.trim()) {
      const errorMsg = "Vui lòng nhập nội dung truyện";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }
    console.log(formData);

    if (formData.type === "AUDIO" && !formData.audioUrl) {
      const errorMsg = "Vui lòng upload file audio";
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const url = storyId ? `admin/stories/${storyId}` : "admin/stories";

      const method = storyId ? "put" : "post";

      const response = await apiClient[method](url, formData);

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        const successMessage = storyId
          ? "Cập nhật truyện thành công!"
          : "Tạo truyện thành công!";

        toast.success(successMessage);

        // Reset form if creating new story
        if (!storyId) {
          setFormData({
            title: "",
            description: "",
            type: "TEXT",
            genreIds: [],
            thumbnailUrl: "",
            audioUrl: "",
            content: "",
            affiliateId: "",
            status: "DRAFT",
            chapters: [] as {
              number: number;
              title: string;
              content?: string;
              audioUrl?: string;
              isLocked: boolean;
            }[],
          });
          setThumbnailPreview("");
          setAudioPreview("");
        }

        // Call success callback to refresh parent list
        if (onSuccess) {
          onSuccess();
        }

        if (onCloseModal) {
          onCloseModal();
        }
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi lưu truyện";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && storyId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 ">
        {/* Error & Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiêu đề truyện *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề truyện..."
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại truyện *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="TEXT">📖 Truyện chữ</option>
                <option value="AUDIO">🎧 Truyện audio</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">📝 Bản nháp</option>
                <option value="PUBLISHED">🌟 Đã xuất bản</option>
                <option value="HIDDEN">👁️ Ẩn</option>
              </select>
            </div>

            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Thể loại * (chọn ít nhất 1)
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700">
                {genres.map((genre) => (
                  <label key={genre.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={formData.genreIds.includes(genre.id)}
                      onChange={(e) =>
                        handleGenreChange(genre.id, e.target.checked)
                      }
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-white">
                      {genre.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Affiliate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                Người dùng sẽ được chuyển đến link này khi click vào thumbnail
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hình ảnh thumbnail
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowImageSelectModal(true)}
                  className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  📁 Chọn từ thư viện
                </button>
              </div>
              {thumbnailPreview && (
                <div className="mt-2">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    width={200}
                    height={250}
                    className="rounded-md object-cover"
                  />
                </div>
              )}
            </div>

            {/* Audio Upload for AUDIO type */}
            {formData.type === "AUDIO" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  File audio *
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAudioSelectModal(true)}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    🎵 Chọn từ thư viện
                  </button>
                </div>
                {audioPreview && (
                  <div className="mt-2">
                    <audio controls className="w-full">
                      <source src={audioPreview} />
                      Trình duyệt không hỗ trợ phát audio.
                    </audio>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mô tả truyện..."
            required
          />
        </div>

        {/* Content for TEXT type */}
        {formData.type === "TEXT" && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nội dung truyện *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập nội dung truyện..."
              required
            />
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCloseModal}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang lưu...
              </div>
            ) : storyId ? (
              "Cập nhật"
            ) : (
              "Tạo mới"
            )}
          </button>
        </div>
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

export default AdminStoryForm;
