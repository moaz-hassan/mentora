"use client";

import { useState, useEffect } from "react";

export default function AIInsightsWidget({ courseId, courseData }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (courseData) {
      fetchInsights();
    }
  }, [courseData]);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const contextData = {
        courseTitle: courseData.title,
        enrollmentCount: courseData.enrollmentCount || 0,
        completionRate: courseData.completionRate || 0,
        averageRating: courseData.averageRating || 0,
        recentActivity: courseData.recentActivity || "No recent activity",
      };

      const response = await fetch(`${API_URL}/api/ai/suggest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          context: {
            type: "course-insights",
            courseId,
            data: contextData,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInsights(data.suggestions);
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">AI-Powered Insights</h3>
        <p className="text-gray-600">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white text-xl">✨</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
      </div>
      
      {insights ? (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap">{insights}</p>
        </div>
      ) : (
        <p className="text-gray-600">No insights available at this time.</p>
      )}
    </div>
  );
}
