"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Comment } from "../../types";
import { commentsAPI } from "../../utils/api";
import CommentList from "./CommentList";
import { FaComments, FaSpinner } from "react-icons/fa";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  chapterId: string;
  className?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  chapterId,
  className = "",
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(0);

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Load comments
  const loadComments = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await commentsAPI.getComments(chapterId, pageNum);
      console.log("Comments API response:", response);

      if (response && response.data) {
        const { comments: newComments, pagination } = response.data;
        console.log("Parsed comments:", newComments, "Pagination:", pagination);

        if (append) {
          setComments((prev) => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }

        setTotalComments(pagination.total);
        setHasMore(pageNum < pagination.pages);
        setPage(pageNum);
      }
    } catch (err: any) {
      console.error("Error loading comments:", err);
      setError("Không thể tải bình luận. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Load more comments
  const loadMore = () => {
    if (!loading && hasMore) {
      loadComments(page + 1, true);
    }
  };

  // Handle new comment creation
  const handleCommentCreated = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
    setTotalComments((prev) => prev + 1);
  };

  // Handle comment update
  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  // Handle comment deletion
  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setTotalComments((prev) => prev - 1);
  };

  // Handle reply creation
  const handleReplyCreated = (parentId: string, newReply: Comment) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [newReply, ...(comment.replies || [])],
          };
        }
        return comment;
      })
    );
    setTotalComments((prev) => prev + 1);
  };

  // Reset state and load comments when chapter changes
  useEffect(() => {
    console.log("Chapter changed to:", chapterId);

    // Reset all state when chapterId changes
    setComments([]);
    setPage(1);
    setHasMore(true);
    setTotalComments(0);
    setError(null);

    // Load comments for new chapter
    loadComments();
  }, [chapterId]);

  return (
    <div className={`comment-section ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <FaComments className="text-blue-500 text-xl" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bình luận
          </h3>
          <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {totalComments}
          </span>
        </div>

        {/* Comment form for authenticated users */}
        {isAuthenticated ? (
          <CommentForm
            chapterId={chapterId}
            onCommentCreated={handleCommentCreated}
            placeholder="Viết bình luận của bạn..."
          />
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Đăng nhập để tham gia bình luận
            </p>
            <button
              onClick={() => (window.location.href = "/auth/login")}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {loading && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-gray-400 text-xl mr-2" />
            <span className="text-gray-600 dark:text-gray-400">
              Đang tải bình luận...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => loadComments()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <FaComments className="text-gray-300 dark:text-gray-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Chưa có bình luận nào
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          <>
            <CommentList
              comments={comments}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              onReplyCreated={handleReplyCreated}
            />

            {/* Load more button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Đang tải...
                    </>
                  ) : (
                    "Tải thêm bình luận"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
