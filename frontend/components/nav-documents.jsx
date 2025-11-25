"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export function NavDocuments({ groupName, items }) {
  const pathname = usePathname();

  // Check if a link is active
  const isActive = (url) => {
    // Exact match for root dashboard pages (instructor, admin, student)
    const rootDashboards = ["/dashboard/instructor", "/dashboard/admin", "/dashboard/student"];
    if (rootDashboards.includes(url)) {
      return pathname === url;
    }
    
    // For other routes, check if pathname starts with the url
    // This handles nested routes like /dashboard/instructor/courses/123
    if (pathname.startsWith(url)) {
      return true;
    }
    
    return false;
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.url);
          
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={active}>
                <Link 
                  href={item.url} 
                  className={`flex items-center gap-2 ${
                    active 
                      ? "bg-blue-50 text-blue-700 font-semibold" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}