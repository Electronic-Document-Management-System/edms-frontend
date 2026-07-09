import { apiClient } from "@/lib/api-client";
import { Comment } from "./comment.types";

const BASE = "/document";

export const getDocumentComments = async (documentId: number): Promise<Comment[]> => {
  const res = await apiClient<{ data: { comments: Comment[] } }>(
    `${BASE}/${documentId}/comments`
  );
  return res.data.comments;
};

export const addComment = async (
  documentId: number,
  content: string
): Promise<Comment> => {
  const res = await apiClient<{ data: { comment: Comment } }>(
    `${BASE}/${documentId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    }
  );
  return res.data.comment;
};

export const updateComment = async (
  documentId: number,
  commentId: number,
  content: string
): Promise<Comment> => {
  const res = await apiClient<{ data: { comment: Comment } }>(
    `${BASE}/${documentId}/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }
  );
  return res.data.comment;
};

export const deleteComment = async (
  documentId: number,
  commentId: number
): Promise<Comment> => {
  const res = await apiClient<{ data: { comment: Comment } }>(
    `${BASE}/${documentId}/comments/${commentId}`,
    { method: "DELETE" }
  );
  return res.data.comment;
};