import Link from "next/link";
import { Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyCoursesState({ searchQuery, statusFilter }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="text-gray-400 dark:text-neutral-500 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No courses found
        </h3>
        <p className="text-gray-600 dark:text-neutral-400 mb-6">
          {searchQuery || statusFilter !== "all"
            ? "Try adjusting your filters"
            : "Get started by creating your first course"}
        </p>
        {!searchQuery && statusFilter === "all" && (
          <Link href="/dashboard/instructor/create-course">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Course
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
