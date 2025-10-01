"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import apiClient from "../../utils/api";
import toast from "react-hot-toast";

interface StatsData {
  totalStories: number;
  totalUsers: number;
  totalViews: number;
  totalChapters: number;
  recentStories: any[];
  recentUsers: any[];
  popularStories: any[];
}

const AdminStats: React.FC = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<StatsData>({
    totalStories: 0,
    totalUsers: 0,
    totalViews: 0,
    totalChapters: 0,
    recentStories: [],
    recentUsers: [],
    popularStories: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      // Call the real API
      const response = await apiClient.get("/admin/dashboard/stats");
      const data = response.data;

      setStats({
        totalStories: data.totalStories || 0,
        totalUsers: data.totalUsers || 0,
        totalViews: data.totalViews || 0,
        totalChapters: data.totalChapters || 0,
        recentStories: Array.isArray(data.recentStories)
          ? data.recentStories.map((story: any) => ({
              id: story.id,
              title: story.title,
              author: story.author?.name || "Unknown",
              createdAt: story.createdAt,
            }))
          : [],
        recentUsers: Array.isArray(data.recentUsers)
          ? data.recentUsers.map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              createdAt: user.createdAt,
            }))
          : [],
        popularStories: Array.isArray(data.topStories)
          ? data.topStories.map((story: any) => ({
              id: story.id || story.slug,
              title: story.title,
              views: story.viewCount || 0,
              bookmarks: story._count?.bookmarks || 0,
            }))
          : [],
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Có lỗi xảy ra khi tải thống kê");
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: t("admin.stats.total_stories"),
      value: stats.totalStories.toLocaleString(),
      icon: "📚",
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: t("admin.stats.total_users"),
      value: stats.totalUsers.toLocaleString(),
      icon: "👥",
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: t("admin.stats.total_views"),
      value: stats.totalViews.toLocaleString(),
      icon: "👁️",
      color: "bg-purple-500",
      change: "+24%",
    },
    {
      title: t("admin.stats.total_chapters"),
      value: stats.totalChapters.toLocaleString(),
      icon: "📖",
      color: "bg-orange-500",
      change: "+15%",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {card.change} {t("admin.stats.from_last_month")}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${card.color} text-white text-xl`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Stories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.stats.recent_stories")}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(stats.recentStories || [])?.map((story) => (
                <div
                  key={story.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {story.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("common.author")}: {story.author}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.stats.recent_users")}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(stats.recentUsers || []).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Stories Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("admin.stats.popular_stories")}
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {(stats.popularStories || []).map((story, index) => (
              <div key={story.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {story.title}
                    </h4>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>👁️ {story.views.toLocaleString()}</span>
                      <span>🔖 {story.bookmarks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
