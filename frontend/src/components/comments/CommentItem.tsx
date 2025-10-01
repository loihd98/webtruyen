"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Comment } from "../../types";
import { commentsAPI } from "../../utils/api";
import CommentForm from "./CommentForm";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  FaReply,
  FaEdit,
  FaTrash,
  FaFlag,
  FaUserCircle,
  FaSpinner,
  FaTimes,
  FaCheck,
} from "react-icons/fa";

interface CommentItemProps {
  comment: Comment;
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onReplyCreated: (parentId: string, reply: Comment) => void;
  depth?: number;
  className?: string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onCommentUpdated,
  onCommentDeleted,
  onReplyCreated,
  depth = 0,
  className = "",
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const isOwner = user?.id === comment.userId;
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAuthenticated && (isOwner || isAdmin);
  const canDelete = isAuthenticated && (isOwner || isAdmin);
  const maxDepth = 3; // Maximum nesting depth for replies

  // Format time ago
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: vi,
  });

  // Handle reply creation
  const handleReplyCreated = (newReply: Comment) => {
    onReplyCreated(comment.id, newReply);
    setShowReplyForm(false);
  };

  // Handle edit comment
  const handleEditSubmit = async () => {
    if (!editContent.trim() || loading) return;

    try {
      setLoading(true);
      const response = await commentsAPI.updateComment(
        comment.id,
        editContent.trim()
      );

      if (response.data?.data?.comment) {
        onCommentUpdated(response.data.data.comment);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      alert("Có lỗi xảy ra khi cập nhật bình luận");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete comment
  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      setLoading(true);
      await commentsAPI.deleteComment(comment.id);
      onCommentDeleted(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Có lỗi xảy ra khi xóa bình luận");
    } finally {
      setLoading(false);
    }
  };

  // Handle report comment
  const handleReport = async () => {
    if (!reportReason.trim() || loading) return;

    try {
      setLoading(true);
      await commentsAPI.reportComment(comment.id, reportReason.trim());
      setShowReportForm(false);
      setReportReason("");
      alert("Đã gửi báo cáo thành công");
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("Có lỗi xảy ra khi gửi báo cáo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`comment-item ${className}`}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm">
        {/* User info and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {comment.user?.avatar ? (
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FaUserCircle className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* User name and time */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {comment.user?.name || "Người dùng"}
                </span>
                {comment.user?.role === "ADMIN" && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {timeAgo}
                {comment.updatedAt !== comment.createdAt && (
                  <span className="ml-1">(đã chỉnh sửa)</span>
                )}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                title="Chỉnh sửa"
              >
                <FaEdit className="w-4 h-4" />
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Xóa"
              >
                {loading ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaTrash className="w-4 h-4" />
                )}
              </button>
            )}

            {isAuthenticated && !isOwner && (
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                title="Báo cáo"
              >
                <FaFlag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Comment content */}
        <div className="mb-3">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Nhập nội dung bình luận..."
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {editContent.length}/1000
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={loading || !editContent.trim()}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded transition-colors"
                  >
                    {loading ? (
                      <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : (
                      <FaCheck className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {comment.content}
            </div>
          )}
        </div>

        {/* Report form */}
        {showReportForm && (
          <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Báo cáo bình luận
            </h4>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Lý do báo cáo..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              rows={2}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {reportReason.length}/500
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReportForm(false);
                    setReportReason("");
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Hủy
                </button>
                <button
                  onClick={handleReport}
                  disabled={loading || !reportReason.trim()}
                  className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded transition-colors"
                >
                  Gửi báo cáo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-4 text-sm">
          {isAuthenticated && depth < maxDepth && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <FaReply className="w-3 h-3" />
              Trả lời
            </button>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <span className="text-gray-500">
              {comment.replies.length} phản hồi
            </span>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && isAuthenticated && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <CommentForm
              chapterId={comment.chapterId}
              parentId={comment.id}
              onCommentCreated={handleReplyCreated}
              placeholder={`Trả lời ${comment.user?.name}...`}
              compact
            />
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onCommentUpdated={onCommentUpdated}
                onCommentDeleted={onCommentDeleted}
                onReplyCreated={onReplyCreated}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
