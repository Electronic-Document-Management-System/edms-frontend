import { apiClient } from "@/lib/api-client";
import {
  DashboardStats,
  DepartmentsResponse,
  DocumentsResponse,
  FoldersResponse,
  RecentDocument,
} from "./dashboard.types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const [departmentsRes, foldersRes, allDocumentsRes, recentDocumentsRes] =
    await Promise.all([
      apiClient<DepartmentsResponse>("/departments"),
      apiClient<FoldersResponse>("/folders"),

      // Count ke liye all documents
      apiClient<DocumentsResponse>("/document"),

      // Dashboard recent list ke liye sirf latest 5 active docs
      apiClient<DocumentsResponse>("/document?status=ACTIVE&page=1&limit=5"),
    ]);

  const departments = departmentsRes.data.departments ?? [];
  const folders = foldersRes.data.folders ?? [];
  const allDocuments = allDocumentsRes.data.documents ?? [];
  const recentDocumentsFromApi = recentDocumentsRes.data.documents ?? [];

  const departmentMap = new Map(
    departments.map((department) => [department.id, department.name]),
  );

  const folderMap = new Map(folders.map((folder) => [folder.id, folder.name]));

  const activeDocuments = allDocuments.filter(
    (document) => !document.isDeleted && document.status === "ACTIVE",
  );

  const archivedDocuments = allDocuments.filter(
    (document) => !document.isDeleted && document.status === "ARCHIVED",
  );

  const recentDocuments: RecentDocument[] = recentDocumentsFromApi
    .filter((document) => !document.isDeleted)
    .slice(0, 5)
    .map((document) => ({
      ...document,
      departmentName:
        departmentMap.get(document.dept_id) ?? `Department #${document.dept_id}`,
      folderName:
        folderMap.get(document.folder_id) ?? `Folder #${document.folder_id}`,
    }));

  return {
    totalDepartments: departments.length,
    totalFolders: folders.length,
    totalDocuments: activeDocuments.length,
    archivedDocuments: archivedDocuments.length,
    recentDocuments,
  };
}