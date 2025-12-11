import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";


export const generatePDF = async (reportData, options = {}) => {
  const pdf = new jsPDF();
  let yPosition = 20;

  
  pdf.setFontSize(24);
  pdf.setFont(undefined, "bold");
  pdf.text("Instructor Analytics Report", 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont(undefined, "normal");
  pdf.setTextColor(100);
  
  if (reportData.overview?.period?.startDate && reportData.overview?.period?.endDate) {
    const startDate = new Date(reportData.overview.period.startDate).toLocaleDateString();
    const endDate = new Date(reportData.overview.period.endDate).toLocaleDateString();
    pdf.text(`Period: ${startDate} - ${endDate}`, 20, yPosition);
    yPosition += 7;
  }
  
  pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
  yPosition += 15;

  
  pdf.setFontSize(16);
  pdf.setFont(undefined, "bold");
  pdf.setTextColor(0);
  pdf.text("Executive Summary", 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.setFont(undefined, "normal");
  
  const summaryData = [
    ["Total Students", reportData.overview?.totalEnrollments || 0],
    ["Active Students", reportData.overview?.activeStudents || 0],
    ["Total Revenue", `$${reportData.overview?.totalRevenue || 0}`],
    ["Average Rating", reportData.overview?.averageRating || "N/A"],
    ["Completion Rate", `${reportData.overview?.completionRate || 0}%`],
  ];

  pdf.autoTable({
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 20, right: 20 },
  });

  yPosition = pdf.lastAutoTable.finalY + 15;

  
  if (reportData.courses && reportData.courses.length > 0) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Course Performance", 20, yPosition);
    yPosition += 10;

    const courseData = reportData.courses.map((course) => [
      course.title,
      course.enrollments || 0,
      `$${course.revenue || 0}`,
      course.sales || 0,
    ]);

    pdf.autoTable({
      startY: yPosition,
      head: [["Course", "Enrollments", "Revenue", "Sales"]],
      body: courseData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    yPosition = pdf.lastAutoTable.finalY + 15;
  }

  
  if (reportData.revenue) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Revenue Analysis", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(11);
    pdf.setFont(undefined, "normal");
    pdf.text(`Total Revenue: $${reportData.revenue.total_revenue || 0}`, 20, yPosition);
    yPosition += 10;

    if (reportData.revenue.revenue_by_month && reportData.revenue.revenue_by_month.length > 0) {
      const monthlyData = reportData.revenue.revenue_by_month.map((item) => [
        item.month,
        `$${item.revenue}`,
        item.sales,
      ]);

      pdf.autoTable({
        startY: yPosition,
        head: [["Month", "Revenue", "Sales"]],
        body: monthlyData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 20, right: 20 },
      });

      yPosition = pdf.lastAutoTable.finalY + 15;
    }
  }

  
  if (reportData.enrollmentTrend && reportData.enrollmentTrend.length > 0) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Enrollment Trend", 20, yPosition);
    yPosition += 10;

    const enrollmentData = reportData.enrollmentTrend.slice(0, 10).map((item) => [
      item.date,
      item.enrollments,
    ]);

    pdf.autoTable({
      startY: yPosition,
      head: [["Date", "Enrollments"]],
      body: enrollmentData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    yPosition = pdf.lastAutoTable.finalY + 15;
  }

  
  if (reportData.engagement) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Student Engagement", 20, yPosition);
    yPosition += 10;

    const engagementData = [
      ["Chat Participation Rate", `${reportData.engagement.chatParticipation || 0}%`],
      ["Total Students", reportData.engagement.totalStudents || 0],
    ];

    pdf.autoTable({
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: engagementData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });

    yPosition = pdf.lastAutoTable.finalY + 15;
  }

  
  if (reportData.quizAnalytics) {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text("Quiz Performance", 20, yPosition);
    yPosition += 10;

    const quizData = [
      ["Average Score", `${reportData.quizAnalytics.averageScore || 0}%`],
      ["Pass Rate", `${reportData.quizAnalytics.passRate || 0}%`],
      ["Total Attempts", reportData.quizAnalytics.totalAttempts || 0],
    ];

    pdf.autoTable({
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: quizData,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 20, right: 20 },
    });
  }

  
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pdf.internal.pageSize.getWidth() / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    pdf.text(
      "Mentora - Instructor Analytics Report",
      20,
      pdf.internal.pageSize.getHeight() - 10
    );
  }

  
  const filename = `analytics-report-${Date.now()}.pdf`;
  pdf.save(filename);
};


export const captureChartAsImage = async (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID ${elementId} not found`);
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error capturing chart:", error);
    return null;
  }
};
