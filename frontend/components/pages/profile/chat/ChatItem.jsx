"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function shouldShowUnreadBadge(unreadCount) {
  return typeof unreadCount === "number" && unreadCount > 0;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
}

export default function ChatItem({ chat, href, onClick }) {
  const hasUnread = shouldShowUnreadBadge(chat?.unreadCount);
  const initials = chat?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const content = (
    <>
      {}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={chat?.avatar_url} alt={chat?.name} />
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
        )}
      </div>

      {}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "text-sm truncate",
            hasUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
          )}>
            {chat?.name || "Unknown"}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTimestamp(chat?.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={cn(
            "text-xs truncate",
            hasUnread ? "text-foreground" : "text-muted-foreground"
          )}>
            {chat?.lastMessage?.content || "No messages yet"}
          </p>
          {hasUnread && (
            <Badge 
              variant="default" 
              className="h-5 min-w-5 px-1.5 text-xs shrink-0"
            >
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </>
  );

  const className = cn(
    "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left",
    hasUnread && "bg-primary/5"
  );

  
  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  
  return (
    <Link href={href || `/chats/${chat.id}`} className={className}>
      {content}
    </Link>
  );
}

