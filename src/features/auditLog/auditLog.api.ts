import { apiClient } from "@/lib/api-client";
import { AuditLog, AuditLogsResponse } from "./auditLog.types";

type AuditLogParams = {
  page?: number;
  limit?: number;
  resource?: string;
  action?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
};
export const getAuditLogs = async (params: AuditLogParams = {}): Promise<AuditLogsResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.resource) query.set("resource", params.resource);
  if (params.action) query.set("action", params.action);
  if (params.userId) query.set("userId", String(params.userId));
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);

  const res = await apiClient<{
    data: {
      auditLogs: {
        logs: AuditLog[];
        total: number;
        page: number;
        limit: number;
      };
    };
  }>(`/audit${query.toString() ? `?${query}` : ""}`);

  return {
    auditLog: res.data.auditLogs.logs,
    total: res.data.auditLogs.total,
    page: res.data.auditLogs.page,
    limit: res.data.auditLogs.limit,
  };
};