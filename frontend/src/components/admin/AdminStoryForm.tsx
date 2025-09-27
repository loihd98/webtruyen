"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAccessToken } from "../../hooks/useAuth";
import { getMediaUrl, validateFileType } from "../../utils/media";

interface Genre {
  id: string;
  name: string;
  slug: string;
}

interface StoryFormData {
  title: string;
  description: string;
  type: "TEXT" | "AUDIO";
  genreIds: string[];
  thumbnailUrl: string;
  audioUrl?: string;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
}

interface AdminStoryFormProps {
  storyId?: string;
  initialData?: Partial<StoryFormData>;
  onSubmit?: (data: StoryFormData) => Promise<void>;
}

const AdminStoryForm: React.FC<AdminStoryFormProps> = ({
  storyId,
  initialData,
  onSubmit,
}) => {
  const router = useRouter();
  const accessToken = useAccessToken();
  const [formData, setFormData] = useState<StoryFormData>({
    title: "",
    description: "",
    type: "TEXT",
    genreIds: [],
    thumbnailUrl: "",
    audioUrl: "",
    status: "DRAFT",
    ...initialData,
  });

  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [audioPreview, setAudioPreview] = useState<string>("");

  // Fetch genres on component mount
  useEffect(() => {
    fetchGenres();
    if (initialData?.thumbnailUrl) {
      setThumbnailPreview(getMediaUrl(initialData.thumbnailUrl));
    }
    if (initialData?.audioUrl) {
      setAudioPreview(getMediaUrl(initialData.audioUrl));
    }
  }, [initialData]);

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/stories/genres");
      if (response.ok) {
        const data = await response.json();
        setGenres(data.genres || []);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
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
    const formData = new FormData();
    formData.append(type, file);

    const response = await fetch(`/api/media/upload/${type}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`);
    }

    const data = await response.json();
    return data.file.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateFileType(file, "image")) {
      alert("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP, GIF)");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadFile(file, "image");
      setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
      setThumbnailPreview(getMediaUrl(url));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Có lỗi khi upload hình ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateFileType(file, "audio")) {
      alert("Vui lòng chọn file audio hợp lệ (MP3, WAV, OGG, AAC, FLAC)");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadFile(file, "audio");
      setFormData((prev) => ({ ...prev, audioUrl: url }));
      setAudioPreview(getMediaUrl(url));
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("Có lỗi khi upload file audio");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề truyện");
      return;
    }

    if (formData.type === "AUDIO" && !formData.audioUrl) {
      alert("Vui lòng upload file audio cho truyện audio");
      return;
    }

    try {
      setLoading(true);

      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default submit behavior
        const url = storyId ? `/api/stories/${storyId}` : "/api/stories";
        const method = storyId ? "PUT" : "POST";

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to save story");
        }

        alert(
          storyId ? "Cập nhật truyện thành công!" : "Tạo truyện thành công!"
        );
        router.push("/admin/stories");
      }
    } catch (error) {
      console.error("Error saving story:", error);
      alert("Có lỗi xảy ra khi lưu truyện");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">
          {storyId ? "Chỉnh sửa truyện" : "Tạo truyện mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tiêu đề truyện *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề truyện"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mô tả
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả truyện"
            />
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Loại truyện
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TEXT">Truyện chữ</option>
                <option value="AUDIO">Truyện audio</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Đã xuất bản</option>
                <option value="HIDDEN">Ẩn</option>
              </select>
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thể loại
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {genres.map((genre) => (
                <label key={genre.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.genreIds.includes(genre.id)}
                    onChange={(e) =>
                      handleGenreChange(genre.id, e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{genre.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh bìa truyện
            </label>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              />
              {thumbnailPreview && (
                <div className="relative w-32 h-48">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Audio Upload (for AUDIO type) */}
          {formData.type === "AUDIO" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Audio *
              </label>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                />
                {audioPreview && (
                  <audio controls className="w-full">
                    <source src={audioPreview} type="audio/mpeg" />
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : storyId ? "Cập nhật" : "Tạo mới"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Hủy
            </button>
          </div>
        </form>

        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">
              <p>Đang upload file...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStoryForm;
