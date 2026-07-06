"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Shield } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { getAuditLogs } from "@/features/auditLog/auditLog.api";
import { AuditLog } from "@/features/auditLog/auditLog.types";

const RESOURCES = [
    "document", "folder", "department", "user",
    "role", "permission", "workflow", "metadata",
];

const actionBadgeColor = (action: string) => {
    if (action.includes("CREATED") || action.includes("LOGIN")) return "default";
    if (action.includes("UPDATED") || action.includes("ASSIGNED")) return "secondary";
    if (action.includes("DELETED") || action.includes("CANCELLED") || action.includes("REVOKED")) return "destructive";
    return "outline";
};

const LIMIT = 20;

export function AuditLogsClient() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Filters
    const [resource, setResource] = useState("all");
    const [action, setAction] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const totalPages = Math.ceil(total / LIMIT);

    const fetchLogs = async (currentPage = 1) => {
        try {
            setIsLoading(true);
            const data = await getAuditLogs({
                page: currentPage,
                limit: LIMIT,
                resource: resource === "all" ? undefined : resource,
                action: action.trim() || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setLogs(data.auditLog);
            setTotal(data.total);
            setPage(currentPage);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load audit logs.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(1);
    }, []);

    const handleApplyFilters = () => {
        fetchLogs(1);
    };

    const handleResetFilters = () => {
        setResource("all");
        setAction("");
        setStartDate("");
        setEndDate("");
        setTimeout(() => fetchLogs(1), 0);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
                <p className="text-muted-foreground">
                    Track all system activity and user actions.
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label>Resource</Label>
                            <Select value={resource} onValueChange={setResource}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All resources" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All resources</SelectItem>
                                    {RESOURCES.map((r) => (
                                        <SelectItem key={r} value={r}>
                                            {r}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Action</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="e.g. DOCUMENT_CREATED"
                                    className="pl-9 uppercase"
                                    value={action}
                                    onChange={(e) => setAction(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>From Date</Label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>To Date</Label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={handleResetFilters}>
                            Reset
                        </Button>
                        <Button onClick={handleApplyFilters} disabled={isLoading}>
                            {isLoading ? "Loading..." : "Apply Filters"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Activity Log
                        {total > 0 && (
                            <span className="ml-auto text-sm font-normal text-muted-foreground">
                                {total} total entries
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading logs...</p>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Resource</TableHead>
                                        <TableHead>Performed By</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>
                                                <Badge variant={actionBadgeColor(log.action)}>
                                                    {log.action.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <span className="capitalize">{log.resource}</span>
                                                {log.resourceId && (
                                                    <span className="ml-1 text-xs text-muted-foreground">
                                                        #{log.resourceId}
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{log.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{log.user.email}</p>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-sm text-muted-foreground">
                                                {log.ipAddress ?? "—"}
                                            </TableCell>

                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {logs.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-10 text-center text-muted-foreground"
                                            >
                                                No audit logs found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchLogs(page - 1)}
                                            disabled={page === 1 || isLoading}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchLogs(page + 1)}
                                            disabled={page === totalPages || isLoading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}