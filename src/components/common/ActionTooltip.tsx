"use client";

import { ReactNode } from "react";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type ActionTooltipProps = {
    label: string;
    children: ReactNode;
    tooltipClassName?: string;
    arrowClassName?: string;
    delayDuration?: number;
};

export function ActionTooltip({
    label,
    children,
    tooltipClassName = "bg-slate-900 text-white",
    arrowClassName = "bg-slate-900 fill-slate-900",
    delayDuration = 200,
}: ActionTooltipProps) {
    return (
        <TooltipProvider delayDuration={delayDuration}>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>

                <TooltipContent
                    className={tooltipClassName}
                    arrowClassName={arrowClassName}
                >
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}