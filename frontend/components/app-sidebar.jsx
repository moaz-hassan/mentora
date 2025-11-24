"use client";

import * as React from "react";
import { NavDocuments } from "@/components/nav-documents";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  IconDatabase,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";

export function AppSidebar({ user, ...props }) {
  let groupsData = [];
  let groupsDataNames = [];
  let navSecondaryData = [];

  if (user.role === "instructor") {
    groupsDataNames = ["Dashboard", "Courses", "Analytics"];
    groupsData = [
      [
        {
          name: "Overview",
          url: "/dashboard/instructor",
          icon: IconInnerShadowTop,
        },
        {
          name: "Chats",
          url: "/dashboard/instructor/chats",
          icon: IconHelp,
        },
      ],
      [
        {
          name: "Create Course",
          url: "/dashboard/instructor/create-course",
          icon: IconDatabase,
        },
        {
          name: "My Courses",
          url: "/dashboard/instructor/courses",
          icon: IconReport,
        },
        {
          name: "Pending Reviews",
          url: "/dashboard/instructor/pending-reviews",
          icon: IconFileWord,
        },
      ],
      [
        {
          name: "Earnings",
          url: "/dashboard/instructor/earnings",
          icon: IconDatabase,
        },
        {
          name: "Analytics",
          url: "/dashboard/instructor/analytics",
          icon: IconReport,
        },
      ],
    ];
    navSecondaryData = [
      {
        title: "Settings",
        url: "/dashboard/instructor/settings",
        icon: <IconSettings />,
      },
      {
        title: "Get Help",
        url: "/dashboard/instructor/help",
        icon: <IconHelp />,
      },
      {
        title: "Search",
        url: "/dashboard/instructor/search",
        icon: <IconSearch />,
      },
    ];
  } else if (user.role === "student") {
    groupsData = [];
    navSecondaryData = [];
  } else if (user.role === "admin") {
    groupsData = [];
    navSecondaryData = [];
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="size-5" />
                <span className="text-base font-semibold">Mentora</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groupsDataNames.length > 0 &&
          groupsDataNames.map((groupName, index) => (
            <NavDocuments
              key={index}
              groupName={groupName}
              items={groupsData[index]}
            />
          ))}
        <NavSecondary items={navSecondaryData} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
