import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function EditCourseHeader({ courseTitle }) {
  return (
    <div className="mb-8">
      <Link
        href="/dashboard/instructor/courses"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Courses
      </Link>
      <h1 className="text-3xl font-bold text-neutral-900">
        Edit Course{courseTitle ? `: ${courseTitle}` : ""}
      </h1>
      <p className="text-neutral-600 mt-2">
        Update your course details and content
      </p>
    </div>
  );
}
