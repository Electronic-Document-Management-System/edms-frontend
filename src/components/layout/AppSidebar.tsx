"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ActionTooltip } from "@/components/common/ActionTooltip";

import { navItems } from "@/config/sidebar.config";
import { usePermission } from "@/hooks/usePermission";

export function AppSidebar() {
  const pathname = usePathname();
  const { can } = usePermission(); 

  const hasPermission = (permission?: string) =>
    !permission || can(permission);

  const isActive = (url: string) =>
    pathname === url || (url !== "/dashboard" && pathname.startsWith(url));

  const visibleItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>EDMS</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon;

                if (item.children) {
                  const visibleChildren = item.children.filter(
                    child => hasPermission(child.permission)
                  );

                  
                  if (visibleChildren.length === 0) return null;

                  const isParentActive = pathname.startsWith(item.url);

                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isParentActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            isActive={isParentActive}
                            tooltip={item.title}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {visibleChildren.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <SidebarMenuSubItem key={child.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(child.url)}
                                  >
                                    <Link href={child.url}>
                                      <ChildIcon className="h-3.5 w-3.5" />
                                      <span>{child.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <ActionTooltip
                      label={item.title}
                      tooltipClassName="bg-slate-900 text-white"
                      arrowClassName="fill-slate-900"
                    >
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <Link href={item.url}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </ActionTooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}