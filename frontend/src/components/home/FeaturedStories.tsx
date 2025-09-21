"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StoryCard from "../stories/StoryCard";
import { storiesAPI } from "../../utils/api";
import { Story } from "../../types";

const FeaturedStories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [audioStories, setAudioStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedStories();
  }, []);

  const fetchFeaturedStories = async () => {
    try {
      setIsLoading(true);

      const [textStories, audioStoriesRes] = await Promise.all([
        storiesAPI.getStories({ type: "TEXT", limit: 6 }),
        storiesAPI.getStories({ type: "AUDIO", limit: 6 }),
      ]);

      setStories(textStories.data?.data || []);
      setAudioStories(audioStoriesRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching featured stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Truyện nổi bật
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse"
            >
              <div className="h-64 bg-gray-300 dark:bg-gray-600"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Text Stories Section */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            📖 Truyện văn bản mới nhất
          </h2>
          <Link
            href="/stories?type=TEXT"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Xem tất cả →
          </Link>
        </div>

        {stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📚</div>
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có truyện văn bản nào.
            </p>
          </div>
        )}
      </section>

      {/* Audio Stories Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎧 Truyện audio nổi bật
          </h2>
          <Link
            href="/stories?type=AUDIO"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Xem tất cả →
          </Link>
        </div>

        {audioStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {audioStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🎧</div>
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có truyện audio nào.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default FeaturedStories;
