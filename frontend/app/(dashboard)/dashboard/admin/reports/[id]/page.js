"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { 
  getReportById, 
  getReportAISummary, 
  updateReportStatus 
} from "@/lib/apiCalls/admin/reports.apiCall";

export default function ReportDetailPage() {
  const [report, setReport] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const router = useRouter();
  const params = useParams();
  const reportId = params.id;

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const result = await getReportById(reportId);
      if (result.success) {
        setReport(result.data.report || result.data);
      } else {
        toast.error(result.error || "Failed to load report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const fetchAISummary = async () => {
    try {
      const result = await getReportAISummary(reportId);
      if (result.success) {
        setAiSummary({ 
          summary: result.data.summary, 
          recommendations: result.data.recommendations 
        });
        toast.success("AI insights generated");
      } else {
        toast.error(result.error || "Failed to generate AI insights");
      }
    } catch (error) {
      console.error("Error fetching AI summary:", error);
      toast.error("Failed to generate AI insights");
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const result = await updateReportStatus(reportId, newStatus);
      if (result.success) {
        setReport(result.data.report || { ...report, status: newStatus });
        toast.success(result.message || "Status updated successfully");
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <p className="text-red-600">Report not found</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Reports
      </button>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Report ID: {report.id}
            </p>
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded ${getSeverityColor(report.ai_severity)}`}>
            {report.ai_severity} severity
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Reporter</p>
            <p className="font-medium">
              {report.Reporter?.first_name} {report.Reporter?.last_name}
            </p>
            <p className="text-sm text-gray-500">{report.Reporter?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted</p>
            <p className="font-medium">
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Content Type</p>
            <p className="font-medium capitalize">{report.content_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">AI Category</p>
            <p className="font-medium">{report.ai_category || "N/A"}</p>
          </div>
        </div>

        {report.content_reference && report.contentDetails && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Reported Content</p>
            <p className="text-sm text-blue-800">
              {report.contentDetails.title || report.contentDetails.name}
            </p>
            <button
              onClick={() => {
                
                const routes = {
                  course: `/courses/${report.content_reference}`,
                  lesson: `/lessons/${report.content_reference}`,
                  quiz: `/quizzes/${report.content_reference}`,
                };
                if (routes[report.content_type]) {
                  router.push(routes[report.content_type]);
                }
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View Content →
            </button>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800 whitespace-pre-wrap">{report.description}</p>
          </div>
        </div>

        {report.ai_reasoning && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">AI Analysis</p>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-gray-800">{report.ai_reasoning}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
          <div className="flex space-x-2">
            <button
              onClick={() => updateStatus("pending")}
              disabled={updating || report.status === "pending"}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Pending
            </button>
            <button
              onClick={() => updateStatus("in-review")}
              disabled={updating || report.status === "in-review"}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              In Review
            </button>
            <button
              onClick={() => updateStatus("resolved")}
              disabled={updating || report.status === "resolved"}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Resolved
            </button>
            <button
              onClick={() => updateStatus("dismissed")}
              disabled={updating || report.status === "dismissed"}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Dismissed
            </button>
          </div>
        </div>

        {report.Reviewer && (
          <div className="text-sm text-gray-600">
            <p>
              Reviewed by {report.Reviewer.first_name} {report.Reviewer.last_name} on{" "}
              {new Date(report.reviewed_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {aiSummary ? (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Insights</h2>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-gray-800">{aiSummary.summary}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h3>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{aiSummary.recommendations}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={fetchAISummary}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate AI Insights
          </button>
        </div>
      )}
    </div>
  );
}
