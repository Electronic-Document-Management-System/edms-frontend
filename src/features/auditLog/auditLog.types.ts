export type AuditLog = {
  id: number;
  action: string;
  resource: string;
  resourceId: number | null;
  userId: number;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
};

export type AuditLogsResponse = {
  auditLog: AuditLog[];
  total: number;
  page: number;
  limit: number;
};