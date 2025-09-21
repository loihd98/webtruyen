"use client";

import React from "react";
import Link from "next/link";
import { Story } from "../../types";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { addBookmark, removeBookmark } from "../../store/slices/bookmarkSlice";
import { openAudioPlayer } from "../../store/slices/uiSlice";
import { AppDispatch } from "../../store";

interface StoryCardProps {
  story: Story;
  variant?: "default" | "compact" | "featured";
  showBookmark?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  variant = "default",
  showBookmark = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);

  const isBookmarked = bookmarks.some(
    (bookmark: any) => bookmark.story?.id === story.id
  );

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = "/auth/login";
      return;
    }

    try {
      if (isBookmarked) {
        const bookmark = bookmarks.find((b: any) => b.story?.id === story.id);
        if (bookmark) {
          await dispatch(removeBookmark(bookmark.id));
        }
      } else {
        await dispatch(addBookmark({ storyId: story.id }));
      }
    } catch (error) {
      console.error("Bookmark error:", error);
    }
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (story.type === "AUDIO" && story.chapters && story.chapters.length > 0) {
      const firstChapter = story.chapters[0];
      if (firstChapter.audioUrl) {
        dispatch(
          openAudioPlayer({
            chapterId: firstChapter.id,
            title: firstChapter.title,
            audioUrl: firstChapter.audioUrl,
            storyTitle: story.title,
          })
        );
      }
    }
  };

  const renderContent = () => {
    switch (variant) {
      case "compact":
        return (
          <Link href={`/stories/${story.slug}`} className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="flex">
                {story.thumbnailUrl && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={story.thumbnailUrl}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm line-clamp-2">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {story.author?.name || "Tác giả không xác định"}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          story.type === "AUDIO"
                            ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                            : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {story.type === "AUDIO" ? "🎧 Audio" : "📖 Text"}
                      </span>
                    </div>
                    {showBookmark && (
                      <button
                        onClick={handleBookmark}
                        className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isBookmarked
                            ? "text-yellow-500"
                            : "text-gray-400 hover:text-yellow-500"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill={isBookmarked ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );

      case "featured":
        return (
          <Link href={`/stories/${story.slug}`} className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {story.thumbnailUrl && (
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={story.thumbnailUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {story.type === "AUDIO" && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <button
                        onClick={handlePlayAudio}
                        className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all"
                      >
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                    {story.title}
                  </h3>
                  {showBookmark && (
                    <button
                      onClick={handleBookmark}
                      className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isBookmarked
                          ? "text-yellow-500"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill={isBookmarked ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  Tác giả: {story.author?.name || "Không xác định"}
                </p>
                {story.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                    {story.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        story.type === "AUDIO"
                          ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                          : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {story.type === "AUDIO" ? "🎧 Audio" : "📖 Text"}
                    </span>
                    {story._count?.chapters && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {story._count.chapters} chương
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>{story.viewCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );

      default:
        return (
          <Link href={`/stories/${story.slug}`} className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
              {story.thumbnailUrl && (
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={story.thumbnailUrl}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {story.type === "AUDIO" && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                        🎧 Audio
                      </span>
                    </div>
                  )}
                  {showBookmark && (
                    <button
                      onClick={handleBookmark}
                      className={`absolute top-2 right-2 p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 ${
                        isBookmarked
                          ? "text-yellow-500"
                          : "text-gray-600 hover:text-yellow-500"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={isBookmarked ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-2">
                  {story.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {story.author?.name || "Tác giả không xác định"}
                </p>
                {story.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                    {story.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    {story._count?.chapters && (
                      <span>{story._count.chapters} chương</span>
                    )}
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span>{story.viewCount}</span>
                    </div>
                  </div>
                  {story.type !== "AUDIO" && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                      📖
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );
    }
  };

  return renderContent();
};

export default StoryCard;
