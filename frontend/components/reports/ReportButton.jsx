"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import ReportForm from "./ReportForm";

export default function ReportButton({ contentId, contentType, className = "" }) {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    setShowForm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className={`flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
      >
        <Flag className="w-4 h-4" />
        <span>Report Issue</span>
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Report an Issue</h2>
            <ReportForm
              contentId={contentId}
              contentType={contentType}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
