export type DocumentVersion = {
  id: number;
  document_id: number;
  versionNumber: number;
  originalName: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  bucketName: string;
  objectKey: string;
  isCurrent: boolean;
  changeNote: string | null;
  uploaded_By: number;
  createdAt: string;
  uploadedBy: {
    id: number;
    name: string;
    email: string;
  };
};
