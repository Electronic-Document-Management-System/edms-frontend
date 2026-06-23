import { MetadataField } from "@/features/metadata/metadataField.types";

export type DocumentMetadata = {
  document_id: number;
  metadataField_id: number;
  value: string;
  createdAt: string;
  updatedAt: string;
  metadataField: MetadataField;
};

export type AddDocumentMetadataInput = {
  metadata_field_id: number;
  value: string;
};