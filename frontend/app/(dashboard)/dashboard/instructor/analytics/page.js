"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { useAnalytics } from "@/hooks/analytics";
import ExportDialog from "@/components/ExportDialog";
import {
  AnalyticsHeader,
  KeyMetricsGrid,
  EnrollmentTrendChart,
  CoursePerformanceSection,
  LessonAnalyticsTable,
  QuizAnalyticsSection,
  DailyEngagementChart,
  StudentProgressDistribution,
  EngagementMetrics,
  RevenueOverview,
  PerformanceInsights,
} from "@/components/instructorDashboard/analytics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InstructorAnalyticsPage() {
  const {
    analytics,
    enrollmentData,
    timeRange,
    selectedCourse,
    loading,
    error,
    setTimeRange,
    setSelectedCourse,
    refetch,
  } = useAnalytics();

  const [showExportDialog, setShowExportDialog] = useState(false);

  const formatNumber = (num) => new Intl.NumberFormat("en-US").format(num);
  const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(147, 51, 234);
    doc.text("Analytics Report", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`Time Range: Last ${timeRange} days`, 14, 33);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Overview", 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Total Students: ${formatNumber(analytics.overview?.totalEnrollments || 0)}`, 14, 53);
    doc.text(`Active Students: ${formatNumber(analytics.overview?.activeStudents || 0)}`, 14, 60);
    doc.text(`Completion Rate: ${analytics.overview?.completionRate?.toFixed(1) || 0}%`, 14, 67);
    doc.text(`Average Rating: ${analytics.overview?.averageRating?.toFixed(1) || "N/A"}`, 14, 74);
    
    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    let csvContent = "Analytics Report\\n";
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\\n`;
    csvContent += `Time Range: Last ${timeRange} days\\n\\n`;
    
    csvContent += "Overview\\n";
    csvContent += `Total Students,${analytics.overview?.totalEnrollments || 0}\\n`;
    csvContent += `Active Students,${analytics.overview?.activeStudents || 0}\\n`;
    csvContent += `Completion Rate,${analytics.overview?.completionRate?.toFixed(1) || 0}%\\n`;
    csvContent += `Average Rating,${analytics.overview?.averageRating?.toFixed(1) || "N/A"}\\n\\n`;
    
    if (analytics.courses?.length > 0) {
      csvContent += "Course Performance\\n";
      csvContent += "Course,Enrollments,Rating,Completion Rate\\n";
      analytics.courses.forEach(course => {
        csvContent += `"${course.title}",${course.enrollments || 0},${course.averageRating?.toFixed(1) || "N/A"},${course.completionRate?.toFixed(1) || 0}%\\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = (format) => {
    if (format === 'pdf') {
      exportToPDF();
    } else if (format === 'csv') {
      exportToCSV();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="p-6 space-y-6">
      <AnalyticsHeader
        selectedCourse={selectedCourse}
        timeRange={timeRange}
        courses={analytics.courses}
        onCourseChange={setSelectedCourse}
        onTimeRangeChange={setTimeRange}
        onExport={() => setShowExportDialog(true)}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        title="Export Analytics Report"
      />

      <KeyMetricsGrid analytics={analytics} formatNumber={formatNumber} />

      {enrollmentData?.enrollments?.length > 0 && (
        <EnrollmentTrendChart data={enrollmentData.enrollments} />
      )}

      {analytics.courses?.length > 0 && (
        <CoursePerformanceSection courses={analytics.courses} formatNumber={formatNumber} />
      )}

      {analytics.lessonAnalytics?.length > 0 && (
        <LessonAnalyticsTable lessons={analytics.lessonAnalytics} formatNumber={formatNumber} />
      )}

      {analytics.quizAnalytics?.quizzes?.length > 0 && (
        <QuizAnalyticsSection quizzes={analytics.quizAnalytics.quizzes} formatNumber={formatNumber} />
      )}

      {analytics.engagement?.dailyEngagement?.length > 0 && (
        <DailyEngagementChart data={analytics.engagement.dailyEngagement} />
      )}

      {analytics.studentProgress && (
        <StudentProgressDistribution progress={analytics.studentProgress} />
      )}

      {analytics.engagement && (
        <EngagementMetrics engagement={analytics.engagement} quizAnalytics={analytics.quizAnalytics} />
      )}

      {analytics.overview && (
        <RevenueOverview overview={analytics.overview} formatCurrency={formatCurrency} formatNumber={formatNumber} />
      )}

      <PerformanceInsights analytics={analytics} />
    </div>
  );
}
