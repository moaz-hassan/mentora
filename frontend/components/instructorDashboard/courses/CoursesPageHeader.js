import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CoursesPageHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-1">
          Manage and track your course content
        </p>
      </div>
      <Link href="/dashboard/instructor/create-course">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Create New Course
        </Button>
      </Link>
    </div>
  );
}
