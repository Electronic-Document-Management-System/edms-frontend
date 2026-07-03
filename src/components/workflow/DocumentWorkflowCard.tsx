"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Ban,
    CheckCircle2,
    Clock,
    History,
    Send,
    UserPlus,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { ActionTooltip } from "@/components/common/ActionTooltip";
import { ConfirmActionDialog } from "@/components/common/ConfirmActionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { usePermission } from "@/hooks/usePermission";
import useAuthStore from "@/store/authStore";

import { getAllUsers } from "@/features/users/users.api";
import { User } from "@/features/users/users.types";

import {
    approveDocumentWorkflow,
    assignReviewer,
    cancelDocumentWorkflow,
    getWorkflowStatus,
    rejectDocumentWorkflow,
    submitDocumentWorkflow,
} from "@/features/workflow/workflow.api";
import { DocumentWorkflowDetail, WorkflowStatus } from "@/features/workflow/workflow.types";
import { PERMISSIONS } from "@/constants/permissions";

type DocumentWorkflowCardProps = {
    documentId: number;
};

const statusConfig: Record<
    WorkflowStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    PENDING_REVIEW: { label: "Pending Review", variant: "secondary" },
    IN_REVIEW: { label: "In Review", variant: "default" },
    APPROVED: { label: "Approved", variant: "default" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    CANCELLED: { label: "Cancelled", variant: "outline" },
};

export function DocumentWorkflowCard({ documentId }: DocumentWorkflowCardProps) {
    const { can } = usePermission();
    const currentUser = useAuthStore((state) => state.user);

    const [workflow, setWorkflow] = useState<DocumentWorkflowDetail | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Assign dialog
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedReviewerId, setSelectedReviewerId] = useState("");

    // Approve/Reject dialog
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
    const [reviewComment, setReviewComment] = useState("");

    // Cancel dialog
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    // Submit confirm
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const workflowData = await getWorkflowStatus(documentId);
            setWorkflow(workflowData);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load workflow.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [documentId]);

    const isSubmitter = workflow && currentUser && workflow.submittedById === currentUser.id;
    const isAssignedReviewer =
        workflow && currentUser && workflow.reviewerId === currentUser.id;

    const canSubmit = can(PERMISSIONS.WORKFLOW_SUBMIT_ALL) || can(PERMISSIONS.WORKFLOW_SUBMIT_OWN) || can(PERMISSIONS.WORKFLOW_SUBMIT_DEPARTMENT);
    const canAssign = can(PERMISSIONS.WORKFLOW_ASSIGN_ALL) || can(PERMISSIONS.WORKFLOW_ASSIGN_DEPARTMENT);
    const canApprove = can(PERMISSIONS.WORKFLOW_APPROVE_ALL) || can(PERMISSIONS.WORKFLOW_APPROVE_DEPARTMENT) || (can(PERMISSIONS.WORKFLOW_APPROVE_ASSIGNED) && isAssignedReviewer);
    const canReject = can(PERMISSIONS.WORKFLOW_REJECT_ALL) || can(PERMISSIONS.WORKFLOW_REJECT_DEPARTMENT) || (can(PERMISSIONS.WORKFLOW_REJECT_ASSIGNED) && isAssignedReviewer);
    const canCancel = can(PERMISSIONS.WORKFLOW_CANCEL_ALL) || can(PERMISSIONS.WORKFLOW_CANCEL_DEPARTMENT) || (can(PERMISSIONS.WORKFLOW_CANCEL_OWN) && isSubmitter);

    const isTerminal = workflow && ["APPROVED", "REJECTED", "CANCELLED"].includes(workflow.status);

    // Load users for the assign-reviewer dropdown only when dialog opens
    const openAssignDialog = async () => {
        try {
            if (users.length === 0) {
                const usersData = await getAllUsers(PERMISSIONS.WORKFLOW_APPROVE_ASSIGNED);
                // console.log(usersData);
                setUsers(usersData.filter((u) => u.isActive));
            }
            setSelectedReviewerId(workflow?.reviewerId ? String(workflow.reviewerId) : "");
            setAssignDialogOpen(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load users.");
        }
    };

    const handleSubmit = async () => {
        try {
            setIsActionLoading(true);
            await submitDocumentWorkflow(documentId);
            toast.success("Document submitted for review.");
            setSubmitDialogOpen(false);
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit document.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedReviewerId) {
            toast.error("Please select a reviewer.");
            return;
        }

        try {
            setIsActionLoading(true);
            await assignReviewer(documentId, Number(selectedReviewerId));
            toast.success("Reviewer assigned successfully.");
            setAssignDialogOpen(false);
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to assign reviewer.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const openReviewDialog = (action: "approve" | "reject") => {
        setReviewAction(action);
        setReviewComment("");
        setReviewDialogOpen(true);
    };

    const handleReviewSubmit = async () => {
        try {
            setIsActionLoading(true);

            if (reviewAction === "approve") {
                await approveDocumentWorkflow(documentId, reviewComment.trim() || undefined);
                toast.success("Document approved.");
            } else {
                await rejectDocumentWorkflow(documentId, reviewComment.trim() || undefined);
                toast.success("Document rejected.");
            }

            setReviewDialogOpen(false);
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit review.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setIsActionLoading(true);
            await cancelDocumentWorkflow(documentId, cancelReason.trim() || undefined);
            toast.success("Workflow cancelled.");
            setCancelDialogOpen(false);
            setCancelReason("");
            await fetchData();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to cancel workflow.");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Workflow</CardTitle>

                {workflow && (
                    <Badge variant={statusConfig[workflow.status].variant}>
                        {statusConfig[workflow.status].label}
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading workflow...</p>
                ) : !workflow ? (
                    // No workflow yet — show submit action
                    <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
                        <p className="text-sm text-muted-foreground">
                            This document has not been submitted for review yet.
                        </p>

                        {canSubmit && (
                            <Button onClick={() => setSubmitDialogOpen(true)}>
                                <Send className="mr-2 h-4 w-4" />
                                Submit for Review
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Status summary */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Submitted by
                                </p>
                                <p className="text-sm font-medium">{workflow.submittedBy.name}</p>
                            </div>

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Reviewer
                                </p>
                                <p className="text-sm font-medium">
                                    {workflow.reviewer ? workflow.reviewer.name : "Not assigned"}
                                </p>
                            </div>

                            {workflow.reviewComment && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Review comment
                                    </p>
                                    <p className="text-sm">{workflow.reviewComment}</p>
                                </div>
                            )}

                            {workflow.cancelReason && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Cancel reason
                                    </p>
                                    <p className="text-sm">{workflow.cancelReason}</p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {!isTerminal && (
                            <div className="flex flex-wrap gap-2 border-t pt-4">
                                {canAssign && (
                                    <Button variant="outline" size="sm" onClick={openAssignDialog}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {workflow.reviewerId ? "Reassign Reviewer" : "Assign Reviewer"}
                                    </Button>
                                )}

                                {workflow.status === "IN_REVIEW" && canApprove && (
                                    <Button size="sm" onClick={() => openReviewDialog("approve")}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Approve
                                    </Button>
                                )}

                                {workflow.status === "IN_REVIEW" && canReject && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openReviewDialog("reject")}
                                    >
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                        Reject
                                    </Button>
                                )}

                                {canCancel && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCancelDialogOpen(true)}
                                    >
                                        <Ban className="mr-2 h-4 w-4 text-red-600" />
                                        Cancel Workflow
                                    </Button>
                                )}
                            </div>
                        )}

                        {isTerminal && canSubmit && (
                            <div className="border-t pt-4">
                                <Button variant="outline" size="sm" onClick={() => setSubmitDialogOpen(true)}>
                                    <Send className="mr-2 h-4 w-4" />
                                    Resubmit for Review
                                </Button>
                            </div>
                        )}

                        {/* History timeline */}
                        {workflow.history.length > 0 && (
                            <div className="border-t pt-4">
                                <p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <History className="h-4 w-4" />
                                    History
                                </p>

                                <div className="space-y-3">
                                    {workflow.history.map((entry) => (
                                        <div key={entry.id} className="flex gap-3 text-sm">
                                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p>
                                                    <span className="font-medium">{entry.performedBy.name}</span>
                                                    {" — "}
                                                    <span className="text-muted-foreground">
                                                        {entry.action.replace(/_/g, " ").toLowerCase()}
                                                    </span>
                                                    {entry.reviewer && (
                                                        <span className="text-muted-foreground">
                                                            {" "}
                                                            ({entry.reviewer.name})
                                                        </span>
                                                    )}
                                                </p>
                                                {entry.comment && (
                                                    <p className="text-muted-foreground">{entry.comment}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(entry.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>

            {/* Submit Confirm */}
            <ConfirmActionDialog
                open={submitDialogOpen}
                onOpenChange={setSubmitDialogOpen}
                isLoading={isActionLoading}
                title="Submit document for review?"
                description="This will start the workflow review process for this document."
                confirmText="Submit"
                loadingText="Submitting..."
                onConfirm={handleSubmit}
            />

            {/* Assign Reviewer Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {workflow?.reviewerId ? "Reassign Reviewer" : "Assign Reviewer"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Reviewer</Label>
                            <Select value={selectedReviewerId} onValueChange={setSelectedReviewerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reviewer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name} ({u.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setAssignDialogOpen(false)}
                                disabled={isActionLoading}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleAssign} disabled={isActionLoading}>
                                {isActionLoading ? "Assigning..." : "Assign"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approve/Reject Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {reviewAction === "approve" ? "Approve Document" : "Reject Document"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Comment (optional)</Label>
                            <Textarea
                                placeholder={
                                    reviewAction === "approve"
                                        ? "Add an approval note..."
                                        : "Explain why this is being rejected..."
                                }
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setReviewDialogOpen(false)}
                                disabled={isActionLoading}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleReviewSubmit} disabled={isActionLoading}>
                                {isActionLoading
                                    ? "Submitting..."
                                    : reviewAction === "approve" ? "Approve" : "Reject"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Workflow</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Reason (optional)</Label>
                            <Textarea
                                placeholder="Why is this workflow being cancelled?"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCancelDialogOpen(false)}
                                disabled={isActionLoading}
                            >
                                Back
                            </Button>
                            <Button variant="destructive" onClick={handleCancel} disabled={isActionLoading}>
                                {isActionLoading ? "Cancelling..." : "Cancel Workflow"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
};