"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function NavSecondary({ items, ...props }) {
  const pathname = usePathname();

  // Check if a link is active
  const isActive = (url) => {
    return pathname === url || pathname.startsWith(url + '/');
  };

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item, index) => {
            const active = isActive(item.url);
            
            return (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link 
                    href={item.url}
                    className={`flex items-center gap-2 ${
                      active 
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold" 
                        : "text-gray-700 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
