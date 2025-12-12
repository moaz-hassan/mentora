"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { UserIcon } from "lucide-react";
import { getNotifications } from "@/lib/apiCalls/notifications/notifications.apiCall";

export default function UserDropDownMenu({
  userName,
  userRole,
  userAvatarUrl,
  onLogout,
}) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await getNotifications(1, 1);
        if (response.success && response.data?.unreadCount !== undefined) {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchUnreadCount();
  }, []);

  const NotificationsMenuItem = () => (
    <Link href="/notifications">
      <DropdownMenuItem className="cursor-pointer flex items-center justify-between">
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </DropdownMenuItem>
    </Link>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={"overflow-hidden"}>
          {userAvatarUrl ? (
            <Image
              src={`${userAvatarUrl}`}
              alt="Student learning on laptop"
              width={25}
              height={25}
              className="object-cover rounded-full"
              priority
            />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          {userName}
        </Button>
      </DropdownMenuTrigger>
      {userRole === "student" && (
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <Link href="/profile">
              <DropdownMenuItem className="cursor-pointer">
                Profile
              </DropdownMenuItem>
            </Link>
            <Link href="/enrollments">
              <DropdownMenuItem className="cursor-pointer">
                My courses
              </DropdownMenuItem>
            </Link>
            <NotificationsMenuItem />
            <Link href="/profile?tab=settings">
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <Link href="/become-instructor">
            <DropdownMenuItem className="cursor-pointer">
              Be instructor
            </DropdownMenuItem>
          </Link>

          <Link href="/help">
            <DropdownMenuItem className="cursor-pointer">Help</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 hover:bg-red-700! transition-all duration-200 hover:text-white! cursor-pointer"
            onClick={onLogout}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}

      {userRole === "instructor" && (
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <Link href="/dashboard/instructor">
              <DropdownMenuItem className="cursor-pointer">
                Dashboard
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/instructor/courses">
              <DropdownMenuItem className="cursor-pointer">
                My courses
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/instructor/chats">
              <DropdownMenuItem className="cursor-pointer">
                Chats
              </DropdownMenuItem>
            </Link>
            <NotificationsMenuItem />
            <Link href="/dashboard/instructor/settings">
              <DropdownMenuItem className="cursor-pointer">
                Settings
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <Link href="/help">
            <DropdownMenuItem className="cursor-pointer">Help</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 hover:bg-red-700! transition-all duration-200 hover:text-white! cursor-pointer"
            onClick={onLogout}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}

      {userRole === "admin" && (
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuGroup>
            <Link href="/dashboard/admin">
              <DropdownMenuItem className="cursor-pointer">
                Dashboard
              </DropdownMenuItem>
            </Link>
            <NotificationsMenuItem />
            <DropdownMenuItem
              className="text-red-600 hover:bg-red-700! transition-all duration-200 hover:text-white! cursor-pointer"
              onClick={onLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

