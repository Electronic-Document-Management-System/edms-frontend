import { apiClient } from "@/lib/api-client";
import {
  DocumentResponse,
  DocumentsResponse,
  UpdateDocumentInput,
  UploadDocumentInput,
} from "./document.types";

type GetDocumentsParams = {
  departmentId?: number;
  folderId?: number;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export async function getDocuments(params: GetDocumentsParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.departmentId) {
    searchParams.set("departmentId", String(params.departmentId));
  }

  if (params.folderId) {
    searchParams.set("folderId", String(params.folderId));
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.page) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }

  const queryString = searchParams.toString();

  const response = await apiClient<DocumentsResponse>(
    `/document${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response.data.documents;
}

export async function getDocumentById(documentId: number) {
  const response = await apiClient<DocumentResponse>(`/document/${documentId}`, {
    method: "GET",
  });

  return response.data.document;
}

export async function uploadDocument(input: UploadDocumentInput) {
  const formData = new FormData();

  formData.append("title", input.title);
  formData.append("description", input.description ?? "");
  formData.append("dept_id", String(input.dept_id));
  formData.append("folder_id", String(input.folder_id));
  formData.append("file", input.file);

  const response = await apiClient<DocumentResponse>("/document", {
    method: "POST",
    body: formData,
  });

  return response.data.document;
}

export async function updateDocument(
  documentId: number,
  input: UpdateDocumentInput,
) {
  const response = await apiClient<DocumentResponse>(`/document/${documentId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });

  return response.data.document;
}

export async function archiveDocument(documentId: number) {
  const response = await apiClient<DocumentResponse>(
    `/document/${documentId}/archive`,
    {
      method: "PATCH",
    },
  );

  return response.data.document;
}

export async function restoreDocument(documentId: number) {
  const response = await apiClient<DocumentResponse>(
    `/document/${documentId}/restore`,
    {
      method: "PATCH",
    },
  );

  return response.data.document;
}

export async function deleteDocument(documentId: number) {
  const response = await apiClient<DocumentResponse>(`/document/${documentId}`, {
    method: "DELETE",
  });

  return response.data.document;
}

export function getDocumentDownloadUrl(documentId: number) {
  return `/api/backend/document/${documentId}/download`;
};

export const getDocumentPreviewUrl = async (
  documentId: number
): Promise<{ previewUrl: string; mimeType: string }> => {
  const res = await apiClient<{ data: { previewUrl: string; mimeType: string } }>(
    `/document/${documentId}/preview-url`
  );
  return res.data;
};