"use client";

import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  BookOpen,
  Trash2,
  AlertTriangle,
  Star,
} from "lucide-react";
import { analyzeCourseWithAI } from "@/lib/apiCalls/admin/courses.apiCall";

export function AdminCourseCard({
  course,
  activeTab,
  onPreview,
  onApprove,
  onReject,
  onDelete,
  onToggleFeatured,
  onAIAnalysisComplete,
}) {
  const handleAnalyzeWithAI = async (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const originalText = btn.innerText;
    btn.innerText = "Analyzing...";
    btn.disabled = true;

    try {
      const result = await analyzeCourseWithAI(course.id);
      if (result.success) {
        onAIAnalysisComplete(course.id, result.data);
        toast.success(result.message || "AI Analysis generated");
      } else {
        toast.error(result.error || "Failed to generate analysis");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error generating analysis");
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  const instructorName = course.Instructor?.first_name && course.Instructor?.last_name
    ? `${course.Instructor.first_name} ${course.Instructor.last_name}`
    : course.instructor?.name || "Unknown Instructor";

  const chaptersCount = course.Chapters?.length || 0;
  const lessonsCount = course.Chapters?.reduce((acc, ch) => acc + (ch.Lessons?.length || 0), 0) || 0;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Thumbnail */}
        <img
          src={course.thumbnail_url || "https://via.placeholder.com/300x169"}
          alt={course.title}
          className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                {course.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                by {instructorName}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {course.is_featured && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </span>
              )}
              {activeTab === "all" && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  course.is_published
                    ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                    : "bg-gray-100 dark:bg-neutral-700 text-gray-800 dark:text-neutral-300"
                }`}>
                  {course.is_published ? "Published" : "Draft"}
                </span>
              )}
              {activeTab === "pending" && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300">
                  Pending Review
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-neutral-400 line-clamp-2 mb-4 text-sm sm:text-base">
            {course.description}
          </p>

          {/* AI Analysis Section (Pending Tab Only) */}
          {activeTab === "pending" && (
            <div className="mb-4">
              {course.ai_analysis ? (
                <AIAnalysisCard analysis={course.ai_analysis} />
              ) : (
                <button
                  onClick={handleAnalyzeWithAI}
                  className="flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze with AI
                </button>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-neutral-400 mb-4">
            <div className="flex items-center">
              <BookOpen className="w-4 h-4 mr-1" />
              {chaptersCount} chapters
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {lessonsCount} lessons
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {course.level}
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 dark:text-white">${course.price}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {activeTab === "all" ? (
              <a
                href={`/courses/${course.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 text-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Course
              </a>
            ) : (
              <button
                onClick={() => onPreview(course.id)}
                className="flex items-center px-3 py-1.5 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 text-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            )}

            {activeTab === "pending" && course.status !== "approved" && (
              <>
                <button
                  onClick={() => onApprove(course)}
                  className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => onReject(course)}
                  className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </>
            )}

            {activeTab === "all" && (
              <>
                <button
                  onClick={() => onToggleFeatured(course.id, !course.is_featured)}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    course.is_featured
                      ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                      : "border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-700"
                  }`}
                >
                  <Star className={`w-4 h-4 mr-2 ${course.is_featured ? "fill-current" : ""}`} />
                  {course.is_featured ? "Featured" : "Feature"}
                </button>
                <button
                  onClick={() => onDelete(course.id)}
                  className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm ml-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// AI Analysis Sub-component
function AIAnalysisCard({ analysis }) {
  return (
    <div className="p-5 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-neutral-800 rounded-xl border border-purple-100 dark:border-purple-800/50 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-semibold text-purple-900 dark:text-purple-300">AI Analysis</span>
        </div>
        <span className={`px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full ${
          analysis.suggested_decision === "approve"
            ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700"
            : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
        }`}>
          Suggestion: {analysis.suggested_decision}
        </span>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wider mb-2">Summary</h4>
        <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed bg-white/50 dark:bg-neutral-900/50 p-3 rounded-lg border border-purple-50 dark:border-purple-800/30">
          {analysis.summary}
        </p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800/50">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wider mb-3">
              <CheckCircle className="w-4 h-4" /> Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-neutral-300">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.weaknesses && analysis.weaknesses.length > 0 && (
          <div className="bg-red-50/50 dark:bg-red-900/20 rounded-lg p-3 border border-red-100 dark:border-red-800/50">
            <h4 className="flex items-center gap-2 text-xs font-semibold text-red-800 dark:text-red-400 uppercase tracking-wider mb-3">
              <AlertTriangle className="w-4 h-4" /> Weaknesses
            </h4>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-neutral-300">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Reasoning */}
      <div className="bg-purple-100/50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-100 dark:border-purple-800/50">
        <h4 className="text-xs font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wider mb-2">Final Reasoning</h4>
        <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">
          {analysis.reasoning}
        </p>
      </div>
    </div>
  );
}
