export type Department = {
  id: number;
  name: string;
  parent_id: number | null;
};

export type DepartmentsResponse = {
  statusCode: number;
  data: {
    departments: Department[];
  };
  message: string;
  success: boolean;
};

export type DepartmentResponse = {
  statusCode: number;
  data: {
    department: Department;
  };
  message: string;
  success: boolean;
};

export type CreateDepartmentInput = {
  name: string;
  parent_id?: number | null;
};

export type UpdateDepartmentInput = {
  name?: string;
  parent_id?: number | null;
};