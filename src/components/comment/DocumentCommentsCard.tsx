"use client";

import { useEffect, useRef, useState } from "react";
import { Edit, MessageSquare, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ActionTooltip } from "@/components/common/ActionTooltip";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import useAuthStore from "@/store/authStore";
import { usePermission } from "@/hooks/usePermission";

import {
  addComment,
  deleteComment,
  getDocumentComments,
  updateComment,
} from "@/features/comment/comment.api";
import { Comment } from "@/features/comment/comment.types";
import { PERMISSIONS } from "@/constants/permissions";

type DocumentCommentsCardProps = {
  documentId: number;
};

export function DocumentCommentsCard({ documentId }: DocumentCommentsCardProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { can } = usePermission();

  const canComment =
    can(PERMISSIONS.COMMENT_CREATE_OWN) ||
    can(PERMISSIONS.COMMENT_CREATE_ALL);

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // New comment
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const data = await getDocumentComments(documentId);
      setComments(data.filter((c) => !c.isDeleted));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load comments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const handleAddComment = async () => {
    if (!newContent.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await addComment(documentId, newContent.trim());
      setComments((prev) => [...prev, created]);
      setNewContent("");
      toast.success("Comment added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditMode = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }

    try {
      setIsEditing(true);
      const updated = await updateComment(documentId, commentId, editContent.trim());
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      );
      setEditingId(null);
      toast.success("Comment updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update comment.");
    } finally {
      setIsEditing(false);
    }
  };

  const openDeleteDialog = (comment: Comment) => {
    setSelectedComment(comment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedComment) return;

    try {
      setIsDeleting(true);
      await deleteComment(documentId, selectedComment.id);
      setComments((prev) => prev.filter((c) => c.id !== selectedComment.id));
      setDeleteDialogOpen(false);
      setSelectedComment(null);
      toast.success("Comment deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete comment.");
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          {comments.length > 0 && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              ({comments.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Comments list */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border p-3 space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{comment.user.name}</span>
                    {comment.isEdited && (
                      <span className="text-xs text-muted-foreground">(edited)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>

                    {currentUser?.id === comment.userId && (
                      <>
                        <ActionTooltip
                          label="Edit comment"
                          tooltipClassName="bg-slate-900 text-white"
                          arrowClassName="fill-slate-900"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openEditMode(comment)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </ActionTooltip>

                        <ActionTooltip
                          label="Delete comment"
                          tooltipClassName="bg-red-600 text-white"
                          arrowClassName="fill-red-600"
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => openDeleteDialog(comment)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </ActionTooltip>
                      </>
                    )}
                  </div>
                </div>

                {/* Content or Edit mode */}
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isEditing}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={isEditing}
                      >
                        {isEditing ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add new comment */}
        {canComment && (
          <div className="border-t pt-4 space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleAddComment();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Ctrl+Enter to submit</p>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={isSubmitting || !newContent.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Posting..." : "Comment"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isLoading={isDeleting}
        variant="destructive"
        title="Delete comment?"
        description="This comment will be permanently removed."
        confirmText="Delete"
        loadingText="Deleting..."
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
}