"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FolderOpen } from "lucide-react";
import OverviewTab from "./OverviewTab";
import ResourcesTab from "./ResourcesTab";

/**
 * ContentTabs - Tabbed interface for Overview and Resources
 * Simplified to two tabs with enhanced visual styling
 */
export default function ContentTabs({
  activeTab = "overview",
  onTabChange,
  lesson,
  upNextLessons = [],
  onLessonSelect,
  onDownload,
}) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full mt-6">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1">
        <TabsTrigger
          value="overview"
          className="gap-2 rounded-t-lg rounded-b-none border-b-2 border-transparent 
                     data-[state=active]:border-primary data-[state=active]:bg-primary/5 
                     data-[state=active]:text-primary px-6 py-3 font-medium
                     hover:bg-muted/50 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="resources"
          className="gap-2 rounded-t-lg rounded-b-none border-b-2 border-transparent 
                     data-[state=active]:border-primary data-[state=active]:bg-primary/5 
                     data-[state=active]:text-primary px-6 py-3 font-medium
                     hover:bg-muted/50 transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          Resources
          {lesson?.materials?.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
              {lesson.materials.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0 pt-6">
        <OverviewTab
          description={lesson?.content}
          lessonTitle={lesson?.title}
          learningObjectives={[]}
        />
      </TabsContent>

      <TabsContent value="resources" className="mt-0 pt-6">
        <ResourcesTab
          materials={lesson?.materials || []}
          upNextLessons={upNextLessons}
          onDownload={onDownload}
          onLessonSelect={onLessonSelect}
        />
      </TabsContent>
    </Tabs>
  );
}
