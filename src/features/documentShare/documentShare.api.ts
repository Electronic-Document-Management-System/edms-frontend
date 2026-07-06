import { apiClient } from "@/lib/api-client";
import { CreateShareInput, DocumentShare } from "./documentShare.types";

const BASE = "/document";

export const getDocumentShares = async (documentId: number): Promise<DocumentShare[]> => {
  const res = await apiClient<{ data: { shares: DocumentShare[] } }>(
    `${BASE}/${documentId}/shares`
  );
  return res.data.shares;
};

export const shareDocument = async (
  documentId: number,
  input: CreateShareInput
): Promise<DocumentShare> => {
  const res = await apiClient<{ data: { sharedDocument: DocumentShare } }>(
    `${BASE}/${documentId}/shares`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  return res.data.sharedDocument;
};

export const revokeDocumentShare = async (
  documentId: number,
  shareId: number
): Promise<DocumentShare> => {
  const res = await apiClient<{ data: { removedShare: DocumentShare } }>(
    `${BASE}/${documentId}/shares/${shareId}`,
    { method: "DELETE" }
  );
  return res.data.removedShare;
};