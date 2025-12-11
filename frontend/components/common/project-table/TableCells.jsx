"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconGripVertical, IconCircleCheckFilled, IconLoader } from "@tabler/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import { toast } from "sonner";

export function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

export function StatusCell({ status }) {
  return (
    <Badge variant="outline" className="text-muted-foreground px-1.5">
      {status === "Done" ? (
        <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
      ) : (
        <IconLoader />
      )}
      {status}
    </Badge>
  );
}

export function EditableCell({ id, value, field, label }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
          loading: `Saving...`,
          success: "Done",
          error: "Error",
        });
      }}
    >
      <Label htmlFor={`${id}-${field}`} className="sr-only">
        {label}
      </Label>
      <Input
        className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
        defaultValue={value}
        id={`${id}-${field}`}
      />
    </form>
  );
}

export function ReviewerCell({ id, reviewer }) {
  const isAssigned = reviewer !== "Assign reviewer";

  if (isAssigned) {
    return reviewer;
  }

  return (
    <>
      <Label htmlFor={`${id}-reviewer`} className="sr-only">
        Reviewer
      </Label>
      <Select>
        <SelectTrigger
          className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
          size="sm"
          id={`${id}-reviewer`}
        >
          <SelectValue placeholder="Assign reviewer" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
          <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
