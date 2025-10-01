"use client";

import React from "react";
import { Comment } from "../../types";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  onCommentUpdated: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onReplyCreated: (parentId: string, reply: Comment) => void;
  className?: string;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onCommentUpdated,
  onCommentDeleted,
  onReplyCreated,
  className = "",
}) => {
  return (
    <div className={`comment-list space-y-4 ${className}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
          onReplyCreated={onReplyCreated}
        />
      ))}
    </div>
  );
};

export default CommentList;
