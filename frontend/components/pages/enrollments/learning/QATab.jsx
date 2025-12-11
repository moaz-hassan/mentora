"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function QATab({ lessonId }) {
  return (
    <div className="py-6">
      <h2 className="text-xl font-semibold mb-4">Questions & Answers</h2>

      {}
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Discussion Coming Soon</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Ask questions, share insights, and connect with other students and the
          instructor.
        </p>
        <Button variant="outline" disabled>
          Ask a Question
        </Button>
      </div>
    </div>
  );
}
