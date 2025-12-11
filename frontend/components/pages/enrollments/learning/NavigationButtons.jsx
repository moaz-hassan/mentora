"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function NavigationButtons({
  hasPrevious = false,
  hasNext = false,
  autoplay = false,
  onPrevious,
  onNext,
  onAutoplayToggle,
  hideAutoplay = false,
}) {
  return (
    <div className="flex items-center justify-between py-4">
      {}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
          className="gap-1"
        >
          Next Lesson
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {}
      {!hideAutoplay && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="autoplay"
            checked={autoplay}
            onCheckedChange={onAutoplayToggle}
          />
          <label
            htmlFor="autoplay"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Autoplay
          </label>
        </div>
      )}
    </div>
  );
}
