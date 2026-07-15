import { apiClient } from "@/lib/api-client";
import {
  DocumentsReportData,
  DepartmentsReportData,
  WorkflowsReportData,
  AuditReportData,
  ReportFilters,
} from "./report.types";

const buildQuery = (filters: ReportFilters = {}) => {
  const query = new URLSearchParams();
  if (filters.departmentId) query.set("departmentId", String(filters.departmentId));
  if (filters.status) query.set("status", filters.status);
  if (filters.startDate) query.set("startDate", filters.startDate);
  if (filters.endDate) query.set("endDate", filters.endDate);
  if (filters.action) query.set("action", filters.action);
  // if (filters.resource) query.set("resource", filters.resource);
  return query.toString();
};

export const getDocumentsReport = async (filters?: ReportFilters): Promise<DocumentsReportData> => {
  const query = buildQuery(filters);
  const res = await apiClient<{ data: DocumentsReportData }>(`/report/documents${query ? `?${query}` : ""}`);
  return res.data;
};

export const getDepartmentsReport = async (): Promise<DepartmentsReportData> => {
  const res = await apiClient<{ data: DepartmentsReportData }>(`/report/departments`);
  return res.data;
};

export const getWorkflowsReport = async (filters?: ReportFilters): Promise<WorkflowsReportData> => {
  const query = buildQuery(filters);
  const res = await apiClient<{ data: WorkflowsReportData }>(`/report/workflows${query ? `?${query}` : ""}`);
  return res.data;
};

export const getAuditReport = async (filters?: ReportFilters): Promise<AuditReportData> => {
  const query = buildQuery(filters);
  const res = await apiClient<{ data: AuditReportData }>(`/report/audit${query ? `?${query}` : ""}`);
  return res.data;
};

const API_BASE_URL = '/api/backend';

export const downloadReportExport = async (
  reportType: "documents" | "departments" | "workflows" | "audit",
  format: "csv" | "pdf",
  filters?: ReportFilters
) => {
  const query = buildQuery(filters);
  const params = new URLSearchParams(query);
  params.set("format", format);

  const res = await fetch(`${API_BASE_URL}/report/${reportType}/export?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to export report");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reportType}-report.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};