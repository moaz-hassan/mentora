"use client";

import { useState } from "react";

export default function AIContentModeration({ content, contentId, contentType }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const analyzeContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          analysisType: "moderation",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Error analyzing content:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">AI Content Moderation</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Content Type: <span className="font-medium">{contentType}</span>
        </p>
        <p className="text-sm text-gray-600">
          Content ID: <span className="font-medium">{contentId}</span>
        </p>
      </div>

      <button
        onClick={analyzeContent}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-4"
      >
        {loading ? "Analyzing..." : "Analyze Content"}
      </button>

      {analysis && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Analysis Result</h4>
          <p className="text-gray-800 whitespace-pre-wrap">{analysis}</p>
        </div>
      )}
    </div>
  );
}
