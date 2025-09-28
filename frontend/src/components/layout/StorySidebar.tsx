"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getMediaUrl } from "../../utils/media";
import apiClient from "@/utils/api";

interface Story {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  type: "TEXT" | "AUDIO";
  viewCount: number;
  author: {
    name: string;
  };
  genres: Array<{
    name: string;
  }>;
}

interface SidebarProps {
  className?: string;
}

export default function StorySidebar({ className = "" }: SidebarProps) {
  const router = useRouter();
  const [hotStories, setHotStories] = useState<Story[]>([]);
  const [trendingStories, setTrendingStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      setLoading(true);

      // Fetch hot stories (most viewed)
      const hotResponse = await apiClient.get(
        "/stories?sort=viewCount&order=desc&limit=5"
      );
      if (hotResponse.data) {
        setHotStories(hotResponse.data.stories || []);
      }

      // Fetch trending stories (recently popular)
      const trendingResponse = await apiClient.get(
        "/stories?sort=createdAt&order=desc&limit=5"
      );
      if (trendingResponse.data) {
        setTrendingStories(trendingResponse.data.stories || []);
      }
    } catch (error) {
      console.error("Error fetching sidebar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StoryItem = ({ story }: { story: Story }) => (
    <div
      onClick={() => router.push(`/stories/${story.slug}`)}
      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
    >
      <div className="relative w-12 h-16 flex-shrink-0 overflow-hidden rounded">
        {story.thumbnailUrl ? (
          <Image
            src={getMediaUrl(story.thumbnailUrl)}
            alt={story.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
            <span className="text-lg">
              {story.type === "AUDIO" ? "🎧" : "📖"}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {story.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {story.author.name}
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <span
            className={`px-1.5 py-0.5 rounded text-xs ${
              story.type === "AUDIO"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            }`}
          >
            {story.type === "AUDIO" ? "🎧" : "📖"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            👁️ {story.viewCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
          <div className="w-12 h-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Hot Stories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-lg">🔥</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Truyện Hot
          </h3>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-1">
            {hotStories.map((story, index) => (
              <div key={story.id} className="relative">
                <div className="absolute -left-2 top-3 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
                  {index + 1}
                </div>
                <StoryItem story={story} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push("/stories?sort=viewCount&order=desc")}
            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Xem tất cả truyện hot →
          </button>
        </div>
      </div>

      {/* Trending Stories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-lg">📈</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Xu hướng
          </h3>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-1">
            {trendingStories.map((story) => (
              <StoryItem key={story.id} story={story} />
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push("/stories?sort=createdAt&order=desc")}
            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Xem truyện mới nhất →
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⚡ Liên kết nhanh
        </h3>

        <div className="space-y-2">
          <button
            onClick={() => router.push("/genres")}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            📚 Thể loại
          </button>
          <button
            onClick={() => router.push("/stories?type=AUDIO")}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            🎧 Truyện Audio
          </button>
          <button
            onClick={() => router.push("/stories?type=TEXT")}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            📖 Truyện Text
          </button>
          <button
            onClick={() => router.push("/bookmarks")}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            ❤️ Yêu thích
          </button>
        </div>
      </div>
    </div>
  );
}
