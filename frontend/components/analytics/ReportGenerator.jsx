"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Calendar, Loader2 } from "lucide-react";
import { generateReport } from "@/lib/apiCalls/analytics/generateReport.apiCall";
import { getAllInstructorCourses } from "@/lib/apiCalls/instructor/getAllInstructorCourses.apiCall";
import { generatePDF } from "@/lib/utils/pdfGenerator";
import { generateCSV } from "@/lib/utils/csvGenerator";

export default function ReportGenerator() {
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [format, setFormat] = useState("pdf");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getAllInstructorCourses();
      setAllCourses(response.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleCourseToggle = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === allCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(allCourses.map((c) => c.id));
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);

      
      const options = {
        startDate: dateRange.start || null,
        endDate: dateRange.end || null,
        courseIds: selectedCourses.length > 0 ? selectedCourses : null,
        anonymizeStudents: true,
      };

      
      const response = await generateReport(options);
      const reportData = response.data;

      
      if (format === "pdf") {
        await generatePDF(reportData);
      } else {
        await generateCSV(reportData);
      }

      setGenerating(false);
      setShowModal(false);
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report. Please try again.");
      setGenerating(false);
    }
  };

  return (
    <>
      {}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <FileText className="w-4 h-4 mr-2" />
        Generate Report
      </button>

      {}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Generate Analytics Report
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Customize your report by selecting date range, courses, and format
              </p>
            </div>

            {}
            <div className="p-6 space-y-6">
              {}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, start: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, end: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-900">
                    Select Courses (Optional)
                  </label>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedCourses.length === allCourses.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {allCourses.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">
                      No courses available
                    </p>
                  ) : (
                    allCourses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleCourseToggle(course.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-900">
                          {course.title}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to include all courses
                </p>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Report Format
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      format === "pdf"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={format === "pdf"}
                      onChange={(e) => setFormat(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <FileText
                        className={`w-8 h-8 mx-auto mb-2 ${
                          format === "pdf" ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          format === "pdf" ? "text-blue-900" : "text-gray-700"
                        }`}
                      >
                        PDF Report
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Formatted document with charts
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      format === "csv"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={format === "csv"}
                      onChange={(e) => setFormat(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <Download
                        className={`w-8 h-8 mx-auto mb-2 ${
                          format === "csv" ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          format === "csv" ? "text-blue-900" : "text-gray-700"
                        }`}
                      >
                        CSV Files (ZIP)
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Multiple CSV files in archive
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={generating}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
