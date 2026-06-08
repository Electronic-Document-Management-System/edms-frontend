import { apiClient } from "@/lib/api-client";
import {
  CreateDepartmentInput,
  DepartmentResponse,
  DepartmentsResponse,
  UpdateDepartmentInput,
} from "./department.types";

export async function getDepartments() {
  const response = await apiClient<DepartmentsResponse>("/departments", {
    method: "GET",
  });

  return response.data.departments;
}

export async function createDepartment(input: CreateDepartmentInput) {
  const response = await apiClient<DepartmentResponse>("/departments", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.department;
}

export async function updateDepartment(
  departmentId: number,
  input: UpdateDepartmentInput,
) {
  const response = await apiClient<DepartmentResponse>(
    `/departments/${departmentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.data.department;
}

export async function deleteDepartment(departmentId: number) {
  const response = await apiClient<DepartmentResponse>(
    `/departments/${departmentId}`,
    {
      method: "DELETE",
    },
  );

  return response.data.department;
}