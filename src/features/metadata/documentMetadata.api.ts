import { apiClient } from "@/lib/api-client";
import { AddDocumentMetadataInput, DocumentMetadata } from "./documentMetadata.types";

const BASE = "/document";

export const getDocumentMetadata = async (
  documentId: number
): Promise<DocumentMetadata[]> => {
  const res = await apiClient<{ data: { documentMetadata: DocumentMetadata[] } }>(
    `${BASE}/${documentId}/metadata`
  );
  return res.data.documentMetadata;
};

export const addDocumentMetadata = async (
  documentId: number,
  input: AddDocumentMetadataInput
): Promise<DocumentMetadata> => {
  const res = await apiClient<{ data: { documentMetadata: DocumentMetadata } }>(
    `${BASE}/${documentId}/metadata`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  return res.data.documentMetadata;
};

export const updateDocumentMetadata = async (
  documentId: number,
  metadataFieldId: number,
  value: string
): Promise<DocumentMetadata> => {
  const res = await apiClient<{ data: { documentMetadata: DocumentMetadata } }>(
    `${BASE}/${documentId}/metadata/${metadataFieldId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ value }),
    }
  );
  return res.data.documentMetadata;
};

export const removeDocumentMetadata = async (
  documentId: number,
  metadataFieldId: number
): Promise<DocumentMetadata> => {
  const res = await apiClient<{ data: { documentMetadata: DocumentMetadata } }>(
    `${BASE}/${documentId}/metadata/${metadataFieldId}`,
    { method: "DELETE" }
  );
  return res.data.documentMetadata;
};