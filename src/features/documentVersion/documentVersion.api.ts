import { apiClient } from "@/lib/api-client";
import { DocumentVersion } from "./documentVersion.types";

const BASE = "/document";

export const getDocumentVersions = async (
  documentId: number
): Promise<DocumentVersion[]> => {
  const res = await apiClient<{ data: DocumentVersion[] }>(
    `${BASE}/${documentId}/versions`
  );
  return res.data;
};

export const createDocumentVersion = async (
  documentId: number,
  file: File,
  changeNote?: string
): Promise<DocumentVersion> => {
  const formData = new FormData();
  formData.append("file", file);
  if (changeNote?.trim()) {
    formData.append("changeNote", changeNote.trim());
  }

  const res = await apiClient<{ data: { version: DocumentVersion } }>(
    `${BASE}/${documentId}/versions`,
    { method: "POST", body: formData }
  );
  return res.data.version;
};

export const restoreDocumentVersion = async (
  documentId: number,
  versionId: number,
  changeNote?: string
): Promise<DocumentVersion> => {
  const res = await apiClient<{ data: { version: DocumentVersion } }>(
    `${BASE}/${documentId}/versions/${versionId}/restore`,
    {
      method: "PATCH",
      body: JSON.stringify({ changeNote }),
    }
  );
  return res.data.version;
};