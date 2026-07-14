"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, ClipboardList, Clock, CheckCircle2, XCircle, Timer } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getWorkflowsReport, downloadReportExport } from "@/features/reports/report.api";
import { ReportFilters, WorkflowsReportData } from "@/features/reports/report.types";
import { ReportFilterBar } from "../ReportFilterBar";
import { WORKFLOW_STATUS_OPTIONS } from "@/constants/reportOptions";

const COLORS: Record<string, string> = {
  "Pending Review": "#f59e0b",
  "In Review": "#3b82f6",
  Approved: "#22c55e",
  Rejected: "#ef4444",
  Cancelled: "#94a3b8",
};

const statusBadgeVariant = (status: string) => {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED" || status === "CANCELLED") return "destructive";
  return "secondary";
};


export function WorkflowsReportTab() {
  const [data, setData] = useState<WorkflowsReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});

  const fetchData = async (currentFilters: ReportFilters) => {
    try {
      setIsLoading(true);
      const result = await getWorkflowsReport(currentFilters);
      setData(result);
    } catch {
      toast.error("Failed to load workflows report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filters);
  }, []);

  const handleApplyFilters = (newFilters: ReportFilters) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const getReportTitle = () => {
    const parts: string[] = [];

    if (filters.startDate && filters.endDate) {
      parts.push(`${filters.startDate} to ${filters.endDate}`)
    } else if (filters.startDate) {
      parts.push(`From ${filters.startDate}`)
    } else if (filters.endDate) {
      parts.push(`Until ${filters.endDate}`)
    }

    if (filters.status) {
      parts.push(filters.status.replace(/_/g, " "))
    };

    if (parts.length === 0) {
      return "Recent Activity Report"
    }
    return `Workflows Report (${parts.join(" . ")})`
  }

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      setIsExporting(true);
      await downloadReportExport("workflows", format, filters);
    } catch {
      toast.error("Failed to export report.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading report...</p>;
  }

  if (!data) return null;

  const chartData = [
    { name: "Pending Review", value: data.pendingReview },
    { name: "In Review", value: data.inReview },
    { name: "Approved", value: data.approved },
    { name: "Rejected", value: data.rejected },
    { name: "Cancelled", value: data.cancelled },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex justify-end items-start">
        <ReportFilterBar
          filters={filters}
          onApply={handleApplyFilters}
          statusOptions={WORKFLOW_STATUS_OPTIONS}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalWorkflows}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingReview + data.inReview}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Turnaround</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgTurnaroundHours}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workflow Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] ?? "#6366f1"} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--popover-foreground)",
                }}
                cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{getReportTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentActivity.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.documentTitle}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(item.status)}>
                      {item.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.reviewerName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {data.recentActivity.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                    No workflow activity found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}