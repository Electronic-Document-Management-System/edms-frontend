export type User = {
  id: number;
  name: string;
  email: string;
  dept_id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserRole = {
  user_id: number;
  role_id: number;
  assigned_by: number | null;
  assigned_at: string;
  role: {
    id: number;
    name: string;
  };
};

export type UserWithRoles = User & {
  roles: UserRole[];
};

export type CreateUserInput = {
  name: string;
  email: string;
  password_hash: string;
  dept_id: number;
};

export type UpdateUserInput = Partial<{
  name: string;
  email: string;
  dept_id: number;
}>;