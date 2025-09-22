"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Story } from "../../types";

const AdminStoryManager: React.FC = () => {
  const { t } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "TEXT" | "AUDIO">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "HIDDEN">("ALL");

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockStories: Story[] = [
          {
            id: "1",
            slug: "dau-pha-thuong-khung",
            title: "Đấu Phá Thương Khung",
            description: "Truyện tu tiên nổi tiếng của Thiên Tàm Thổ Đậu",
            thumbnailUrl: "https://via.placeholder.com/300x400?text=ĐPTK",
            type: "TEXT",
            status: "PUBLISHED",
            viewCount: 45234,
            authorId: "author1",
            createdAt: "2025-01-15T00:00:00Z",
            updatedAt: "2025-09-22T00:00:00Z",
            author: {
              id: "author1",
              name: "Thiên Tàm Thổ Đậu",
              avatar: "https://via.placeholder.com/100x100?text=TTTĐ"
            },
            _count: {
              chapters: 1200,
              bookmarks: 3421
            }
          },
          {
            id: "2",
            slug: "tien-nghich",
            title: "Tiên Nghịch",
            description: "Tu tiên kinh điển của Nhĩ Căn",
            thumbnailUrl: "https://via.placeholder.com/300x400?text=TN",
            type: "AUDIO",
            status: "PUBLISHED",
            viewCount: 38945,
            authorId: "author2",
            createdAt: "2025-02-10T00:00:00Z",
            updatedAt: "2025-09-21T00:00:00Z",
            author: {
              id: "author2",
              name: "Nhĩ Căn",
            },
            _count: {
              chapters: 890,
              bookmarks: 2876
            }
          },
          {
            id: "3",
            slug: "hoan-my-the-gioi",
            title: "Hoàn Mỹ Thế Giới",
            description: "Thế giới hoàn mỹ đầy kỳ ảo",
            thumbnailUrl: "https://via.placeholder.com/300x400?text=HMTG",
            type: "TEXT",
            status: "DRAFT",
            viewCount: 12456,
            authorId: "author3",
            createdAt: "2025-03-05T00:00:00Z",
            updatedAt: "2025-09-20T00:00:00Z",
            author: {
              id: "author3",
              name: "Thần Đông",
            },
            _count: {
              chapters: 456,
              bookmarks: 1234
            }
          }
        ];
        setStories(mockStories);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching stories:", error);
      setIsLoading(false);
    }
  };

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.author?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || story.type === filterType;
    const matchesStatus = filterStatus === "ALL" || story.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDelete = async (storyId: string) => {
    if (window.confirm(t("admin.stories.confirm_delete"))) {
      setStories(prev => prev.filter(story => story.id !== storyId));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", text: t("common.published") },
      DRAFT: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", text: t("common.draft") },
      HIDDEN: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: t("common.hidden") },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === "AUDIO" ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
        🎧 {t("common.audio")}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        📖 {t("common.text")}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
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
              {t("admin.stories.title")}
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + {t("admin.stories.create_new")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.stories.search")}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("admin.stories.search_placeholder")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("common.type")}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">{t("stories.filter.all")}</option>
                <option value="TEXT">{t("stories.filter.text")}</option>
                <option value="AUDIO">{t("stories.filter.audio")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("common.status")}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">{t("stories.filter.all")}</option>
                <option value="PUBLISHED">{t("common.published")}</option>
                <option value="DRAFT">{t("common.draft")}</option>
                <option value="HIDDEN">{t("common.hidden")}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchStories}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 {t("admin.stories.refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.stories.story")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.author")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.type")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("common.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.stories.stats")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.stories.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStories.map((story) => (
                <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={story.thumbnailUrl || "https://via.placeholder.com/60x80?text=No+Image"}
                        alt={story.title}
                        className="h-16 w-12 object-cover rounded"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {story.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {story.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {story.author?.name || t("admin.stories.unknown_author")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(story.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(story.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-1">
                      <div>👁️ {story.viewCount.toLocaleString()}</div>
                      <div>📖 {story._count?.chapters || 0}</div>
                      <div>🔖 {story._count?.bookmarks || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingStory(story)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? t("admin.stories.no_results") : t("admin.stories.no_stories")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStoryManager;