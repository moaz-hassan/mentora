"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * LearningPageLayout - Split-panel layout with responsive sidebar
 * Desktop: sidebar + main content side by side
 * Mobile: collapsible sidebar drawer
 */
export default function LearningPageLayout({
  header,
  sidebar,
  mainContent,
  sidebarWidth = "320px",
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {header}

      {/* Main layout */}
      <div className="flex-1 flex">
        {/* Desktop sidebar */}
        <aside
          className="hidden lg:block border-r bg-muted/30 overflow-y-auto"
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
          {sidebar}
        </aside>

        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed bottom-4 left-4 z-50">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button size="icon" className="rounded-full shadow-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              {sidebar}
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {mainContent}
        </main>
      </div>
    </div>
  );
}
