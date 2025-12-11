"use client";

import { User, BookOpen, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "my-learning", label: "My Learning", icon: BookOpen },
  { id: "account-settings", label: "Account", icon: Settings },
  { id: "payment-methods", label: "Payments", icon: CreditCard },
];

export default function ProfileTabs({ activeTab, onTabChange }) {
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-xl border shadow-sm">
      <nav 
        className="flex p-1.5 gap-1 overflow-x-auto scrollbar-hide" 
        aria-label="Profile navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-lg transition-all duration-200 flex-1 justify-center sm:flex-none group",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn(
                "h-4 w-4 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-105"
              )} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
