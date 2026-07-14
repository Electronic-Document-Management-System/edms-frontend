"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ReportFilters } from "@/features/reports/report.types";

type Option = { value: string; label: string };

type ReportFilterBarProps = {
    filters: ReportFilters;
    onApply: (filters: ReportFilters) => void;
    statusOptions?: Option[];
    actionOptions?: Option[];
    resourceOptions?: Option[];
    showDepartment?: boolean;
    departments?: { id: number; name: string }[];
};

export function ReportFilterBar({
    filters,
    onApply,
    statusOptions,
    actionOptions,
    resourceOptions,
    showDepartment,
    departments,
}: ReportFilterBarProps) {
    const [localFilters, setLocalFilters] = useState<ReportFilters>(filters);

    const handleApply = () => {
        onApply(localFilters);
    };

    const handleReset = () => {
        const cleared: ReportFilters = {};
        setLocalFilters(cleared);
        onApply(cleared);
    };

    const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

    return (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
            {showDepartment && departments && (
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <Select
                        value={localFilters.departmentId ? String(localFilters.departmentId) : "all"}
                        onValueChange={(val) =>
                            setLocalFilters((prev) => ({
                                ...prev,
                                departmentId: val === "all" ? undefined : Number(val),
                            }))
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All departments</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={String(dept.id)}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {statusOptions && (
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                        value={localFilters.status ?? "all"}
                        onValueChange={(val) =>
                            setLocalFilters((prev) => ({ ...prev, status: val === "all" ? undefined : val }))
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {actionOptions && (
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Action</Label>
                    <Select
                        value={localFilters.action ?? "all"}
                        onValueChange={(val) =>
                            setLocalFilters((prev) => ({ ...prev, action: val === "all" ? undefined : val }))
                        }
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All actions</SelectItem>
                            {actionOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* {resourceOptions && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Resource</Label>
          <Select
            value={localFilters.resource ?? "all"}
            onValueChange={(val) =>
              setLocalFilters((prev) => ({ ...prev, resource: val === "all" ? undefined : val }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All resources</SelectItem>
              {resourceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )} */}

            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">From Date</Label>
                <Input
                    type="date"
                    className="w-40"
                    value={localFilters.startDate ?? ""}
                    onChange={(e) =>
                        setLocalFilters((prev) => ({ ...prev, startDate: e.target.value || undefined }))
                    }
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">To Date</Label>
                <Input
                    type="date"
                    className="w-40"
                    value={localFilters.endDate ?? ""}
                    onChange={(e) =>
                        setLocalFilters((prev) => ({ ...prev, endDate: e.target.value || undefined }))
                    }
                />
            </div>

            <div className="flex gap-2">
                <Button size="sm" onClick={handleApply}>
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    Apply
                </Button>
                {hasActiveFilters && (
                    <Button size="sm" variant="ghost" onClick={handleReset}>
                        <X className="mr-2 h-3.5 w-3.5" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}