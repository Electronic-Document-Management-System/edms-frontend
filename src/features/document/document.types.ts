export type DocumentStatus = "ACTIVE" | "ARCHIVED" | "DELETED" | string;

export type DocumentItem = {
  id: number;
  title: string;
  description: string | null;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  bucketName: string;
  objectKey: string;
  status: DocumentStatus;
  isArchived: boolean;
  archivedAt: string | null;
  archivedBy: number | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: number | null;
  dept_id: number;
  folder_id: number;
  uploaded_by: number;
  createdAt: string;
  updatedAt: string;
};

export type DocumentsResponse = {
  statusCode: number;
  data: {
    documents: DocumentItem[];
  };
  message: string;
  success: boolean;
};

export type DocumentResponse = {
  statusCode: number;
  data: {
    document: DocumentItem;
  };
  message: string;
  success: boolean;
};

export type UploadDocumentInput = {
  title: string;
  description?: string;
  dept_id: number;
  folder_id: number;
  file: File;
};

export type UpdateDocumentInput = {
  title?: string;
  description?: string;
  dept_id?: number;
  folder_id?: number;
};