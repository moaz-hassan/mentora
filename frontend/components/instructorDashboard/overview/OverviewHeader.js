import Link from "next/link";
import { Plus } from "lucide-react";

export function OverviewHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your teaching performance.
        </p>
      </div>
      <Link
        href="/dashboard/instructor/create-course"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Course
      </Link>
    </div>
  );
}
