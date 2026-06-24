import { apiClient } from "@/lib/api-client";
import { DocumentWorkflow, DocumentWorkflowDetail, WorkflowSubmission } from "./workflow.types";

const BASE = "/document";

export const getWorkflowStatus = async (
  documentId: number
): Promise<DocumentWorkflowDetail | null> => {
  try {
    const res = await apiClient<{ data: { workflow: DocumentWorkflowDetail } }>(
      `${BASE}/${documentId}/workflow-status`
    );
    return res.data.workflow;
  } catch (error) {
    // 404 = workflow abhi exist nahi karta, yeh normal hai naye document ke liye
    if (error instanceof Error && error.message.toLowerCase().includes("not found")) {
      return null;
    }
    throw error;
  }
};

export const submitDocumentWorkflow = async (
  documentId: number
): Promise<DocumentWorkflow> => {
  const res = await apiClient<{ data: { workflow: DocumentWorkflow } }>(
    `${BASE}/${documentId}/workflow/submit`,
    { method: "POST" }
  );
  return res.data.workflow;
};

export const assignReviewer = async (
  documentId: number,
  reviewerId: number
): Promise<DocumentWorkflow> => {
  const res = await apiClient<{ data: { workflow: DocumentWorkflow } }>(
    `${BASE}/${documentId}/workflow/assign-reviewer`,
    {
      method: "POST",
      body: JSON.stringify({ reviewerId }),
    }
  );
  return res.data.workflow;
};

export const approveDocumentWorkflow = async (
  documentId: number,
  comment?: string
): Promise<DocumentWorkflow> => {
  const res = await apiClient<{ data: { workflow: DocumentWorkflow } }>(
    `${BASE}/${documentId}/workflow/approve`,
    {
      method: "POST",
      body: JSON.stringify({ comment }),
    }
  );
  return res.data.workflow;
};

export const rejectDocumentWorkflow = async (
  documentId: number,
  comment?: string
): Promise<DocumentWorkflow> => {
  const res = await apiClient<{ data: { workflow: DocumentWorkflow } }>(
    `${BASE}/${documentId}/workflow/reject`,
    {
      method: "POST",
      body: JSON.stringify({ comment }),
    }
  );
  return res.data.workflow;
};

export const cancelDocumentWorkflow = async (
  documentId: number,
  reason?: string
): Promise<DocumentWorkflow> => {
  const res = await apiClient<{ data: { workflow: DocumentWorkflow } }>(
    `${BASE}/${documentId}/workflow/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
  return res.data.workflow;
};

export const getMyWorkflowSubmissions = async () => {
    const res = await apiClient<{data: {workflows: DocumentWorkflowDetail[]}}>(
        "/workflow/my-submissions"
    )
    return res.data.workflows;
};

export const getMyAssignedWorkflows = async (): Promise<WorkflowSubmission[]> => {
  const res = await apiClient<{ data: { workflows: WorkflowSubmission[] } }>(
    "/workflow/assigned-to-me"
  );
  return res.data.workflows;
};