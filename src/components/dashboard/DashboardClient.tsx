"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getDashboardStats } from "@/features/dashboard/dashboard.api";
import { DashboardStats } from "@/features/dashboard/dashboard.types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load dashboard.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const cards = [
    {
      title: "Total Documents",
      value: stats?.totalDocuments ?? 0,
      description: "Active uploaded files",
    },
    {
      title: "Departments",
      value: stats?.totalDepartments ?? 0,
      description: "Active departments",
    },
    {
      title: "Folders",
      value: stats?.totalFolders ?? 0,
      description: "Organized folders",
    },
    {
      title: "Archived",
      value: stats?.archivedDocuments ?? 0,
      description: "Archived documents",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of departments, folders and documents.
          </p>
        </div>

        <Button asChild>
          <Link href="/documents/upload">Upload Document</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? "..." : card.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading recent documents...
            </p>
          ) : stats?.recentDocuments.length ? (
            <div className="space-y-3">
              {stats.recentDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{document.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {document.departmentName} / {document.folderName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {document.originalName}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                    {document.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recent documents found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}