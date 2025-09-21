"use client";

import React from "react";
import { Chapter } from "../../types";

interface ChapterListProps {
  chapters: Chapter[];
  currentChapter?: number;
  onChapterSelect: (chapter: Chapter) => void;
  showUnlockStatus?: boolean;
  unlockedChapters?: string[];
  onUnlockChapter?: (chapter: Chapter) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentChapter,
  onChapterSelect,
  showUnlockStatus = false,
  unlockedChapters = [],
  onUnlockChapter,
}) => {
  const isChapterUnlocked = (chapter: Chapter) => {
    if (!chapter.isLocked) return true;
    return unlockedChapters.includes(chapter.id);
  };

  const handleChapterClick = (chapter: Chapter) => {
    if (showUnlockStatus && chapter.isLocked && !isChapterUnlocked(chapter)) {
      if (onUnlockChapter) {
        onUnlockChapter(chapter);
      }
      return;
    }
    onChapterSelect(chapter);
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Chưa có chương nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter) => {
        const isUnlocked = isChapterUnlocked(chapter);
        const isCurrent = currentChapter === chapter.number;

        return (
          <div
            key={chapter.id}
            className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all ${
              isCurrent
                ? "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
                : isUnlocked
                ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                : "bg-gray-50 dark:bg-gray-800 opacity-75"
            }`}
            onClick={() => handleChapterClick(chapter)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded ${
                      isCurrent
                        ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Chương {chapter.number}
                  </span>
                  <h3
                    className={`font-medium truncate ${
                      isCurrent
                        ? "text-blue-900 dark:text-blue-100"
                        : isUnlocked
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {chapter.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    {new Date(chapter.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  {chapter.audioUrl && (
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 14l-2-2H7a1 1 0 01-1-1v-2a1 1 0 011-1h3l2-2v8z"
                        />
                      </svg>
                      Audio
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {showUnlockStatus && (
                  <div className="flex items-center">
                    {chapter.isLocked ? (
                      isUnlocked ? (
                        <span className="text-green-500 dark:text-green-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-yellow-500 dark:text-yellow-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </span>
                      )
                    ) : (
                      <span className="text-green-500 dark:text-green-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                )}

                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>

            {!isUnlocked && chapter.isLocked && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      Chương này cần mở khóa
                    </span>
                  </div>
                  <button className="text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-700">
                    Mở khóa
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChapterList;
