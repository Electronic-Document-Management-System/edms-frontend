'use client';

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DocumentsReportTab } from "@/components/reports/tabs/DocumentsReportTab";
import { DepartmentsReportTab } from "@/components/reports/tabs/DepartmentsReportTab";
import { WorkflowsReportTab } from "@/components/reports/tabs/WorkflowsReportTab";
import { AuditReportTab } from "@/components/reports/tabs/AuditReportTab";

export function ReportClient() {
    const [activeTab, setActiveTab] = useState("documents");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
                <p className="text-muted-foreground">
                    View system-wide statistics and export detailed reports.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="workflows">Workflows</TabsTrigger>
                    <TabsTrigger value="audit">Audit</TabsTrigger>
                </TabsList>

                <TabsContent value="documents">
                    <DocumentsReportTab />
                </TabsContent>
                <TabsContent value="departments">
                    <DepartmentsReportTab />
                </TabsContent>
                <TabsContent value="workflows">
                    <WorkflowsReportTab />
                </TabsContent>
                <TabsContent value="audit">
                    <AuditReportTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}