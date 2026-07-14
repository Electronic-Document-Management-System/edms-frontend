"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, ShieldCheck, Activity, Users } from "lucide-react";
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

import { getAuditReport, downloadReportExport } from "@/features/reports/report.api";
import { AuditReportData, ReportFilters } from "@/features/reports/report.types";
import { ReportFilterBar } from "../ReportFilterBar";
import { AUDIT_ACTION_OPTIONS, AUDIT_RESOURCE_OPTIONS } from "@/constants/reportOptions";

export function AuditReportTab() {
    const [data, setData] = useState<AuditReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [filters, setFilters] = useState<ReportFilters>({});

    const fetchData = async (currentFilters: ReportFilters) => {
        try {
            setIsLoading(true);
            const result = await getAuditReport(currentFilters);
            setData(result);
        } catch {
            toast.error("Failed to load audit report.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filters);
    }, []);

    const handleApplyFilters = async (newFilters: ReportFilters) => {
        setFilters(newFilters);
        fetchData(newFilters)
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
            return "Recent Audit Activity"
        }
        return `Audit Report (${parts.join(" . ")})`
    };

    const handleExport = async (format: "csv" | "pdf") => {
        try {
            setIsExporting(true);
            await downloadReportExport("audit", format, filters);
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

    const topActions = [...data.byAction].sort((a, b) => b.count - a.count).slice(0, 8);

    return (
        <div className="space-y-6 pt-4">
            <div className="flex justify-end items-start">
                <ReportFilterBar
                    filters={filters}
                    onApply={handleApplyFilters}
                    actionOptions={AUDIT_ACTION_OPTIONS}
                    resourceOptions={AUDIT_RESOURCE_OPTIONS}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalEvents}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Unique Actions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.byAction.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.byUser.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Top Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={topActions} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis
                                    type="category"
                                    dataKey="action"
                                    tick={{ fontSize: 10 }}
                                    width={140}
                                    tickFormatter={(value) => value.replace(/_/g, " ")}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--popover)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        color: "var(--popover-foreground)",
                                    }}
                                    cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Most Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={data.byUser} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="userName" tick={{ fontSize: 11 }} width={100} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--popover)",
                                        border: "1px solid var(--border)",
                                        borderRadius: "8px",
                                        color: "var(--popover-foreground)",
                                    }}
                                    cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                                />
                                <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{getReportTitle()}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Action</TableHead>
                                <TableHead>Resource</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.recentEvents.map((event) => (
                                <TableRow key={event.id}>
                                    <TableCell>
                                        <Badge variant="outline">{event.action.replace(/_/g, " ")}</Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">{event.resource}</TableCell>
                                    <TableCell>{event.user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(event.createdAt).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data.recentEvents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-6 text-center text-muted-foreground">
                                        No audit events found.
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