export type LoginInput = {
  email: string;
  password: string;
};

export type AuthRole = {
  user_id: number;
  role_id: number;
  assigned_by: number | null;
  assigned_at: string;
  role: {
    id: number;
    name: string;
  };
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  refreshToken: string | null;
  dept_id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles: AuthRole[];
  permissions: string[];
};

export type LoginResponse = {
  statusCode: number;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  success: boolean;
};