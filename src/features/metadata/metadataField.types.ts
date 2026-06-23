export type MetadataFieldType = "TEXT" | "NUMBER" | "DATE" | "BOOLEAN" | "SELECT";

export type MetadataField = {
  id: number;
  name: string;
  key: string;
  type: MetadataFieldType;
  isRequired: boolean;
  isActive: boolean;
  options: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMetadataFieldInput = {
  name: string;
  key: string;
  type: MetadataFieldType;
  isRequired?: boolean;
  isActive?: boolean;
  options?: string[];
};

export type UpdateMetadataFieldInput = Partial<CreateMetadataFieldInput>;