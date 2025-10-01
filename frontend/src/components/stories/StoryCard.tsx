"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Story } from "../../types";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { addBookmark, removeBookmark } from "../../store/slices/bookmarkSlice";
import { openAudioPlayer } from "../../store/slices/uiSlice";
import { AppDispatch } from "../../store";
import { getMediaUrl } from "../../utils/media";
import Image from "next/image";
interface StoryCardProps {
  story: Story;
  variant?: "default" | "compact" | "featured" | "card";
  showBookmark?: boolean;
}

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  variant = "default",
  showBookmark = true,
}) => {
  console.log("story", story?.type);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { bookmarks } = useSelector((state: RootState) => state.bookmarks);

  const isBookmarked = bookmarks.some(
    (bookmark: any) =>
      bookmark.story?.id === story.id || bookmark.storyId === story.id
  );

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = "/auth/login";
      return;
    }

    console.log("Bookmark action:", {
      isBookmarked,
      storyId: story.id,
      bookmarks,
    });

    try {
      if (isBookmarked) {
        const bookmark = bookmarks.find(
          (b: any) =>
            b.story?.id === story.id ||
            b.storyId === story.id ||
            b.storyId === story.id
        );
        console.log("Found bookmark to remove:", bookmark);
        if (bookmark) {
          await dispatch(removeBookmark(bookmark.id));
        }
      } else {
        console.log("Adding bookmark for story:", story.id);
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

  const handleCardClick = (e: React.MouseEvent) => {
    // If story has affiliate link, open it in new tab
    if (story.affiliate && story.affiliate.isActive) {
      window.open(story.affiliate.targetUrl, "_blank", "noopener,noreferrer");
    }
    // Then navigate to story page (this will happen after the new tab opens)
    router.push(`/stories/${story.slug}`);
  };

  const renderContent = () => {
    switch (variant) {
      case "compact":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
            <div className="flex">
              <div
                className="w-12 h-12 flex-shrink-0 relative cursor-pointer group/thumb"
                onClick={handleCardClick}
              >
                {story.thumbnailUrl ? (
                  <img
                    src={getMediaUrl(story.thumbnailUrl)}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover/thumb:opacity-90 transition-opacity rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded ${
                    story.thumbnailUrl ? "hidden" : ""
                  }`}
                >
                  <div className="text-xl text-gray-400">
                    {story.type === "AUDIO" ? "🎧" : "📖"}
                  </div>
                </div>
              </div>
              <div
                className="flex-1 p-2 cursor-pointer group"
                onClick={handleCardClick}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-xs line-clamp-2">
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
        );

      case "featured":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
            <div
              className="aspect-video relative overflow-hidden cursor-pointer group/thumb"
              onClick={handleCardClick}
            >
              {story.thumbnailUrl ? (
                <img
                  src={getMediaUrl(story.thumbnailUrl)}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
                  story.thumbnailUrl ? "hidden" : ""
                }`}
              >
                <div className="text-4xl text-gray-400">
                  {story.type === "AUDIO" ? "🎧" : "📖"}
                </div>
              </div>
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
            <div className="p-3 cursor-pointer group" onClick={handleCardClick}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                  {story.title}
                </h3>
                {showBookmark && (
                  <button
                    onClick={handleBookmark}
                    className={`p-1 rounded-full transition-all duration-200 ${
                      isBookmarked
                        ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                        : "text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isBookmarked ? "currentColor" : "none"}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={isBookmarked ? 0 : 2}
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
        );

      case "card":
        return (
          <div
            key={story?.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group h-[400px] flex flex-col"
          >
            {/* Fixed height thumbnail area */}
            <div
              className="relative h-48 overflow-hidden cursor-pointer group/thumb flex-shrink-0"
              onClick={handleCardClick}
            >
              {story?.thumbnailUrl ? (
                <img
                  src={getMediaUrl(story.thumbnailUrl)}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover/thumb:opacity-90 transition-opacity rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : // <Image
              //   src={getMediaUrl(story.thumbnailUrl)}
              //   alt={story?.title ?? ""}
              //   fill
              //   className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
              //   onError={(e) => {
              //     const target = e.target as HTMLImageElement;
              //     target.style.display = "none";
              //     target.nextElementSibling?.classList.remove("hidden");
              //   }}
              // />
              null}
              <div
                className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
                  story?.thumbnailUrl ? "hidden" : ""
                }`}
              >
                <div className="text-4xl text-gray-400">
                  {story?.type === "AUDIO" ? "🎧" : "📖"}
                </div>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    story?.type === "AUDIO"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {story?.type === "AUDIO" ? "🎧 Audio" : "📖 Text"}
                </span>
              </div>

              {showBookmark && (
                <button
                  onClick={handleBookmark}
                  className={`absolute p-1 bottom-2 right-2 rounded-full transition-all duration-200 ${
                    isBookmarked
                      ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-900/70"
                      : "text-gray-600 bg-white bg-opacity-90 hover:bg-opacity-100 hover:text-yellow-500"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={isBookmarked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isBookmarked ? 0 : 2}
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

            {/* Content area with flexible height */}
            <div
              className="p-3 cursor-pointer group flex-1 flex flex-col"
              onClick={handleCardClick}
            >
              <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm">
                {story?.title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                👤 {story?.author?.name}
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {story?.description || "Chưa có mô tả"}
              </p>

              {/* Genres - flexible space */}
              <div className="flex flex-wrap gap-1 mb-3 flex-1">
                {story?.genres?.slice(0, 2).map((genre) => (
                  <span
                    key={genre.id}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs h-fit"
                  >
                    {genre.name}
                  </span>
                ))}

                {(story?.genres?.length ?? 0) > 2 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs h-fit">
                    +{(story?.genres?.length ?? 0) - 2}
                  </span>
                )}
              </div>

              {/* Stats - always at bottom */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
                <span>👁️ {story?.viewCount?.toLocaleString()}</span>
                <span>
                  📅 {new Date(story?.createdAt)?.toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
            <div
              className="aspect-video relative overflow-hidden cursor-pointer group/thumb"
              onClick={handleCardClick}
            >
              {story.thumbnailUrl ? (
                <img
                  src={getMediaUrl(story.thumbnailUrl)}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${
                  story.thumbnailUrl ? "hidden" : ""
                }`}
              >
                <div className="text-4xl text-gray-400">
                  {story.type === "AUDIO" ? "🎧" : "📖"}
                </div>
              </div>
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
                  className={`absolute bottom-2 right-2 p-2 rounded-full transition-all duration-200 ${
                    isBookmarked
                      ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-900/70"
                      : "text-gray-600 bg-white bg-opacity-90 hover:bg-opacity-100 hover:text-yellow-500"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={isBookmarked ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={isBookmarked ? 0 : 2}
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
            <div className="p-3 cursor-pointer group" onClick={handleCardClick}>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-2 text-sm">
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
        );
    }
  };

  return renderContent();
};

export default StoryCard;
