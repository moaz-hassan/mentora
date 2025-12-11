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

  
  const isActive = (url) => {
    
    const rootDashboards = ["/dashboard/instructor", "/dashboard/admin", "/dashboard/student"];
    if (rootDashboards.includes(url)) {
      return pathname === url;
    }
    
    
    
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
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold" 
                      : "text-gray-700 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
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