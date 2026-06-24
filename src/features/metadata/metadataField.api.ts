import { apiClient } from "@/lib/api-client";
import {
  CreateMetadataFieldInput,
  MetadataField,
  UpdateMetadataFieldInput,
} from "./metadataField.types";

const BASE = "/metadata";

export const getAllMetadataFields = async (): Promise<MetadataField[]> => {
  const res = await apiClient<{ data: { metadataFields: MetadataField[] } }>(
    `${BASE}/fields`
  );
  return res.data.metadataFields;
};

export const getMetadataFieldById = async (id: number): Promise<MetadataField> => {
  const res = await apiClient<{ data: { metadataField: MetadataField } }>(
    `${BASE}/fields/${id}`
  );
  return res.data.metadataField;
};

export const createMetadataField = async (
  input: CreateMetadataFieldInput
): Promise<MetadataField> => {
  const res = await apiClient<{ data: { metadataField: MetadataField } }>(
    `${BASE}/fields`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  return res.data.metadataField;
};

export const updateMetadataField = async (
  id: number,
  input: UpdateMetadataFieldInput
): Promise<MetadataField> => {
  const res = await apiClient<{ data: { metadataField: MetadataField } }>(
    `${BASE}/fields/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
  return res.data.metadataField;
};

export const deleteMetadataField = async (id: number): Promise<MetadataField> => {
  const res = await apiClient<{ data: { metadataField: MetadataField } }>(
    `${BASE}/fields/${id}`,
    { method: "DELETE" }
  );
  return res.data.metadataField;
};