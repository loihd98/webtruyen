"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Comment } from "../../types";
import { commentsAPI } from "../../utils/api";
import { FaUserCircle, FaSpinner, FaPaperPlane } from "react-icons/fa";

interface CommentFormProps {
  chapterId: string;
  parentId?: string;
  onCommentCreated: (comment: Comment) => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  chapterId,
  parentId,
  onCommentCreated,
  placeholder = "Viết bình luận của bạn...",
  compact = false,
  className = "",
}) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || loading) return;

    try {
      setLoading(true);
      const response = await commentsAPI.createComment(
        chapterId,
        content.trim(),
        parentId
      );

      if (response.data?.data?.comment) {
        onCommentCreated(response.data.data.comment);
        setContent("");
        setFocused(false);
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Có lỗi xảy ra khi tạo bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`comment-form ${className}`}>
      <div
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg ${
          focused ? "ring-2 ring-blue-500 border-transparent" : ""
        } transition-all`}
      >
        {/* User avatar and input */}
        <div className="flex gap-3 p-4">
          {!compact && (
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-8 h-8 text-gray-400" />
              )}
            </div>
          )}

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none border-none outline-none ${
                compact ? "text-sm" : ""
              }`}
              rows={compact ? 2 : 3}
              maxLength={1000}
              disabled={loading}
            />
          </div>
        </div>

        {/* Actions bar */}
        {(focused || content.length > 0) && (
          <div className="flex items-center justify-between px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <span
                className={`text-gray-500 dark:text-gray-400 ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                {content.length}/1000
              </span>

              {!compact && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Nhấn Ctrl+Enter để gửi
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {content.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setContent("");
                    setFocused(false);
                  }}
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  disabled={loading}
                >
                  Hủy
                </button>
              )}

              <button
                type="submit"
                disabled={loading || !content.trim()}
                className={`flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors ${
                  compact ? "text-sm" : ""
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin" />
                    {compact ? "Gửi..." : "Đang gửi..."}
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4" />
                    {compact ? "Gửi" : "Bình luận"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Character warning */}
      {content.length > 900 && (
        <div className="mt-2 text-sm text-orange-500 dark:text-orange-400">
          Còn lại {1000 - content.length} ký tự
        </div>
      )}
    </form>
  );
};

export default CommentForm;
