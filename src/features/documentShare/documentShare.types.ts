export type SharePermission = "VIEW" | "DOWNLOAD";

export type DocumentShare = {
  id: number;
  document_id: number;
  sharedWithUserId: number;
  sharedByUserId: number;
  permission: SharePermission;
  message: string | null;
  expiresAt: string | null;
  isRevoked: boolean;
  revokedAt: string | null;
  revokedBy: number | null;
  createdAt: string;
  updatedAt: string;
  sharedWithUser: {
    id: number;
    name: string;
    email: string;
    dept_id?: number;
    isActive?: boolean;
  };
  sharedByUser: {
    id: number;
    name: string;
    email: string;
  };
};

export type CreateShareInput = {
  sharedWithUserId: number;
  permission: SharePermission;
  message?: string;
  expiresAt?: string;
};