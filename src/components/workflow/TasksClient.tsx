"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { getMyWorkflowSubmissions } from "@/features/workflow/workflow.api";
import { WorkflowStatus, WorkflowSubmission } from "@/features/workflow/workflow.types";

const statusConfig: Record<
    WorkflowStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
    PENDING_REVIEW: { label: "Pending Review", variant: "secondary" },
    IN_REVIEW: { label: "In Review", variant: "default" },
    APPROVED: { label: "Approved", variant: "default" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    CANCELLED: { label: "Cancelled", variant: "outline" },
};

export function TasksClient() {
    const [submissions, setSubmissions] = useState<WorkflowSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await getMyWorkflowSubmissions();
            setSubmissions(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load tasks.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredSubmissions = useMemo(() => {
        if (statusFilter === "all") return submissions;
        return submissions.filter((s) => s.status === statusFilter);
    }, [submissions, statusFilter]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
                <p className="text-muted-foreground">
                    Track the review status of documents you have submitted.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {Object.entries(statusConfig).map(([status, config]) => (
                                <SelectItem key={status} value={status}>
                                    {config.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Submitted Documents</CardTitle>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading tasks...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reviewer</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="w-[80px] text-right">View</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredSubmissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <div>
                                                    <p className="font-medium">{submission.document.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {submission.document.originalName}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>{submission.document.department.name}</TableCell>

                                        <TableCell>
                                            <Badge variant={statusConfig[submission.status].variant}>
                                                {statusConfig[submission.status].label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell>
                                            {submission.reviewer ? submission.reviewer.name : "—"}
                                        </TableCell>

                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                        </TableCell>

                                        <TableCell>
                                            <Button size="icon" variant="outline" asChild>
                                                <Link href={`/documents/${submission.document.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {filteredSubmissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                                            No submissions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};