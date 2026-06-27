"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, FileText, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getMyAssignedWorkflows } from "@/features/workflow/workflow.api";
import { WorkflowSubmission } from "@/features/workflow/workflow.types";

export default function ApprovalsClient() {
  const [assignments, setAssignments] = useState<WorkflowSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await getMyAssignedWorkflows();
      setAssignments(data ?? []);
    } catch (error) {
      setAssignments([]);
      toast.error(error instanceof Error ? error.message : "Failed to load approvals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Approvals</h2>
        <p className="text-muted-foreground">
          Documents assigned to you for review.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Your Review</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading approvals...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Submitted by</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="w-[120px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="font-medium">{assignment.document.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.document.originalName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{assignment.document.department.name}</TableCell>

                    <TableCell>
                      {assignment.assignedBy ? assignment.assignedBy.name : "—"}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {assignment.assignedAt
                        ? new Date(assignment.assignedAt).toLocaleDateString()
                        : "—"}
                    </TableCell>

                    <TableCell>
                      <Button size="sm" asChild>
                        <Link href={`/documents/${assignment.document.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {assignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No pending approvals.
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
}