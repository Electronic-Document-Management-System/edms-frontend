export type Comment = {
  id: number;
  document_id: number;
  userId: number;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};