"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Archive, HardDrive, Files } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

import { getDocumentsReport, downloadReportExport } from "@/features/reports/report.api";
import { DocumentsReportData, ReportFilters } from "@/features/reports/report.types";
import { ReportFilterBar } from "../ReportFilterBar";
import { DOCUMENT_STATUS_OPTIONS } from "@/constants/reportOptions";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];


export function DocumentsReportTab() {
  const [data, setData] = useState<DocumentsReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});

  const fetchData = async (currentFilters: ReportFilters) => {
    try {
      setIsLoading(true);
      const result = await getDocumentsReport(currentFilters);
      setData(result);
    } catch {
      toast.error("Failed to load documents report.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(filters)
  }, []);

  const handleApplyFilters = async (newFilters: ReportFilters) => {
    setFilters(newFilters);
    fetchData(newFilters)
  }

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
      return "Recent Uploaded Documents"
    }
    return `Documents (${parts.join(" . ")})`
  }

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      setIsExporting(true);
      await downloadReportExport("documents", format, filters);
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

  return (
    <div className="space-y-6 pt-4">

      {/* Export button */}
      <div className="flex items-start justify-end gap-4">
        <ReportFilterBar
          filters={filters}
          onApply={handleApplyFilters}
          statusOptions={DOCUMENT_STATUS_OPTIONS}
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Archived</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.archivedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.storageUsed / 1024 / 1024).toFixed(1)} MB</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.byDepartment}>
                <XAxis dataKey="departmentName" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    color: "var(--popover-foreground)",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} activeBar={{ fill: "#818cf8" }} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documents by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.byStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.byStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
      </div>

      {/* Recent uploads table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{getReportTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentUploads.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {data.recentUploads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                    No recent uploads.
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