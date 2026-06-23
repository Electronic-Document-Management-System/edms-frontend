export type WorkflowStatus =
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type WorkflowAction =
  | "SUBMITTED"
  | "REVIEWER_ASSIGNED"
  | "REVIEWER_REASSIGNED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type WorkflowUser = {
  id: number;
  name: string;
  email: string;
};

export type WorkflowHistoryEntry = {
  id: number;
  workflow_id: number;
  document_id: number;
  action: WorkflowAction;
  fromStatus: WorkflowStatus | null;
  toStatus: WorkflowStatus | null;
  performedById: number;
  reviewerId: number | null;
  comment: string | null;
  createdAt: string;
  performedBy: WorkflowUser;
  reviewer: WorkflowUser | null;
};

export type DocumentWorkflow = {
  id: number;
  document_id: number;
  status: WorkflowStatus;
  submittedById: number;
  submittedAt: string;
  reviewerId: number | null;
  assignedById: number | null;
  assignedAt: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelledById: number | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DocumentWorkflowDetail = DocumentWorkflow & {
  document: { id: number; title: string };
  submittedBy: WorkflowUser;
  reviewer: WorkflowUser | null;
  assignedBy: WorkflowUser | null;
  history: WorkflowHistoryEntry[];
};

export type WorkflowSubmission = DocumentWorkflow & {
  document: {
    id: number;
    title: string;
    description: string | null;
    originalName: string;
    mimeType: string;
    fileSize: number;
    status: string;
    isArchived: boolean;
    dept_id: number;
    folder_id: number;
    department: { id: number; name: string };
    folder: { id: number; name: string };
    uploadedBy: WorkflowUser;
    metadata: {
      id: number;
      value: string;
      metadataField: { id: number; name: string };
    }[];
  };
  reviewer: WorkflowUser | null;
  assignedBy: WorkflowUser | null;
};

