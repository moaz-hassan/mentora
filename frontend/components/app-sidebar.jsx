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
  IconChartBar,
  IconCategory,
  IconTicket,
  IconCash,
  IconUsers,
  IconBell,
  IconFileText,
  IconSpeakerphone,
  IconChartPie,
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
        url: "/help",
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
    navSecondaryData = [
      {
        title: "Settings",
        url: "/dashboard/student/settings",
        icon: <IconSettings />,
      },
      {
        title: "Get Help",
        url: "/help",
        icon: <IconHelp />,
      },
      {
        title: "Search",
        url: "/dashboard/student/search",
        icon: <IconSearch />,
      },
    ];
  } else if (user.role === "admin") {
    groupsDataNames = ["Dashboard", "Content", "Users", "Marketing", "System"];
    groupsData = [
      // Dashboard
      [
        {
          name: "Overview",
          url: "/dashboard/admin",
          icon: IconInnerShadowTop,
        },
        {
          name: "Analytics",
          url: "/dashboard/admin/analytics",
          icon: IconChartBar,
        },
        {
          name: "Platform Analytics",
          url: "/dashboard/admin/platform-analytics",
          icon: IconChartPie,
        },
      ],
      // Content
      [
        {
          name: "Courses",
          url: "/dashboard/admin/courses",
          icon: IconDatabase,
        },
        {
          name: "Categories",
          url: "/dashboard/admin/categories",
          icon: IconCategory,
        },
        {
          name: "Reports",
          url: "/dashboard/admin/reports",
          icon: IconReport,
        },
      ],
      // Users
      [
        {
          name: "Users",
          url: "/dashboard/admin/users",
          icon: IconFileWord,
        },
        {
          name: "Instructors",
          url: "/dashboard/admin/instructors",
          icon: IconUsers,
        },
      ],
      // Marketing
      [
        {
          name: "Coupons",
          url: "/dashboard/admin/coupons",
          icon: IconTicket,
        },
        {
          name: "Marketing",
          url: "/dashboard/admin/marketing",
          icon: IconSpeakerphone,
        },
        {
          name: "Notifications",
          url: "/dashboard/admin/notifications",
          icon: IconBell,
        },
      ],
      // System
      [
        {
          name: "Financial",
          url: "/dashboard/admin/financial",
          icon: IconCash,
        },
        {
          name: "Audit Logs",
          url: "/dashboard/admin/logs",
          icon: IconFileText,
        },
        {
          name: "Settings",
          url: "/dashboard/admin/settings",
          icon: IconSettings,
        },
      ],
    ];
    navSecondaryData = [
      {
        title: "Get Help",
        url: "/help",
        icon: <IconHelp />,
      },
    ];
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
