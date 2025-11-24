import Papa from "papaparse";
import JSZip from "jszip";

/**
 * Generate CSV files from analytics data and bundle in ZIP
 * @param {Object} reportData - The report data from backend
 * @returns {Promise<void>}
 */
export const generateCSV = async (reportData) => {
  const zip = new JSZip();

  // 1. Overview CSV
  if (reportData.overview) {
    const overviewData = [
      {
        "Total Enrollments": reportData.overview.totalEnrollments || 0,
        "Active Students": reportData.overview.activeStudents || 0,
        "Completion Rate": `${reportData.overview.completionRate || 0}%`,
        "Average Rating": reportData.overview.averageRating || "N/A",
        "Total Revenue": `$${reportData.overview.totalRevenue || 0}`,
      },
    ];

    const overviewCSV = Papa.unparse(overviewData);
    zip.file("overview.csv", overviewCSV);
  }

  // 2. Courses CSV
  if (reportData.courses && reportData.courses.length > 0) {
    const coursesData = reportData.courses.map((course) => ({
      "Course ID": course.id,
      "Course Title": course.title,
      "Enrollments": course.enrollments || 0,
      "Revenue": `$${course.revenue || 0}`,
      "Sales": course.sales || 0,
      "Price": `$${course.price || 0}`,
    }));

    const coursesCSV = Papa.unparse(coursesData);
    zip.file("courses.csv", coursesCSV);
  }

  // 3. Revenue by Month CSV
  if (reportData.revenue && reportData.revenue.revenue_by_month) {
    const revenueData = reportData.revenue.revenue_by_month.map((item) => ({
      "Month": item.month,
      "Revenue": `$${item.revenue}`,
      "Sales": item.sales,
    }));

    const revenueCSV = Papa.unparse(revenueData);
    zip.file("revenue_by_month.csv", revenueCSV);
  }

  // 4. Revenue by Course CSV
  if (reportData.revenue && reportData.revenue.revenue_by_course) {
    const revenueByCourseData = reportData.revenue.revenue_by_course.map((item) => ({
      "Course ID": item.course_id,
      "Course Title": item.course_title,
      "Course Price": `$${item.course_price || 0}`,
      "Revenue": `$${item.revenue}`,
      "Sales": item.sales,
    }));

    const revenueByCourseCSV = Papa.unparse(revenueByCourseData);
    zip.file("revenue_by_course.csv", revenueByCourseCSV);
  }

  // 5. Enrollment Trend CSV
  if (reportData.enrollmentTrend && reportData.enrollmentTrend.length > 0) {
    const enrollmentData = reportData.enrollmentTrend.map((item) => ({
      "Date": item.date,
      "Enrollments": item.enrollments,
    }));

    const enrollmentCSV = Papa.unparse(enrollmentData);
    zip.file("enrollment_trend.csv", enrollmentCSV);
  }

  // 6. Engagement Metrics CSV
  if (reportData.engagement) {
    const engagementData = [
      {
        "Chat Participation Rate": `${reportData.engagement.chatParticipation || 0}%`,
        "Total Students": reportData.engagement.totalStudents || 0,
      },
    ];

    const engagementCSV = Papa.unparse(engagementData);
    zip.file("engagement.csv", engagementCSV);
  }

  // 7. Quiz Analytics CSV
  if (reportData.quizAnalytics) {
    const quizData = [
      {
        "Average Score": `${reportData.quizAnalytics.averageScore || 0}%`,
        "Pass Rate": `${reportData.quizAnalytics.passRate || 0}%`,
        "Total Attempts": reportData.quizAnalytics.totalAttempts || 0,
      },
    ];

    const quizCSV = Papa.unparse(quizData);
    zip.file("quiz_analytics.csv", quizCSV);
  }

  // Generate ZIP file
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // Trigger download
  const url = window.URL.createObjectURL(zipBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `analytics-report-${Date.now()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate a single CSV file
 * @param {Array} data - Array of objects to convert to CSV
 * @param {string} filename - Name of the file
 */
export const generateSingleCSV = (data, filename) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
