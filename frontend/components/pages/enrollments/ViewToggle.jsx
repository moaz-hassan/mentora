"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode("grid")}
        className={cn(
          "h-8 w-8 rounded-md transition-all",
          viewMode === "grid" 
            ? "bg-background shadow-sm text-primary hover:bg-background hover:text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Grid View"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setViewMode("list")}
        className={cn(
          "h-8 w-8 rounded-md transition-all",
          viewMode === "list" 
            ? "bg-background shadow-sm text-primary hover:bg-background hover:text-primary" 
            : "text-muted-foreground hover:text-foreground"
        )}
        title="List View"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
