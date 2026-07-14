"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Building2, Users, Files, FolderOpen } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
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

import { getDepartmentsReport, downloadReportExport } from "@/features/reports/report.api";
import { DepartmentsReportData } from "@/features/reports/report.types";

export function DepartmentsReportTab() {
    const [data, setData] = useState<DepartmentsReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const result = await getDepartmentsReport();
                setData(result);
            } catch {
                toast.error("Failed to load departments report.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleExport = async (format: "csv" | "pdf") => {
        try {
            setIsExporting(true);
            await downloadReportExport("departments", format);
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

    const totalUsers = data.departments.reduce((sum, d) => sum + d.userCount, 0);
    const totalDocuments = data.departments.reduce((sum, d) => sum + d.documentCount, 0);

    return (
        <div className="space-y-6 pt-4">
            <div className="flex justify-end">
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Departments</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalDepartments}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
                        <Files className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDocuments}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Documents by Department</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={data.departments}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
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
                            <Bar
                                dataKey="documentCount"
                                fill="#6366f1"
                                radius={[4, 4, 0, 0]}
                                activeBar={{ fill: "#818cf8" }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <FolderOpen className="h-4 w-4" />
                        Department Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Department</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Documents</TableHead>
                                <TableHead>Folders</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.departments.map((dept) => (
                                <TableRow key={dept.id}>
                                    <TableCell className="font-medium">{dept.name}</TableCell>
                                    <TableCell>{dept.userCount}</TableCell>
                                    <TableCell>{dept.documentCount}</TableCell>
                                    <TableCell>{dept.folderCount}</TableCell>
                                </TableRow>
                            ))}
                            {data.departments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                                        No departments found.
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