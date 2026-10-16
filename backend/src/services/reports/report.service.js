import { Report, User, Course, Lesson, Quiz } from "../../models/index.js";
import geminiService from "../ai/gemini.service.js";

class ReportService {
  async createReport(reportData, userId) {
    try {
      const user = await User.findById(userId).select("id first_name last_name email role").lean();

      if (!user) {
        throw new Error("User not found");
      }

      const reporterType = user.role === "instructor" ? "instructor" : "student";

      if (reporterType === "instructor") {
        if (!reportData.contactEmail && !reportData.contactPhone) {
          throw new Error("Instructor reports require contact information");
        }
        if (!reportData.priority) {
          reportData.priority = "medium";
        }
      }

      let aiAnalysis = {
        category: "other",
        severity: reporterType === "instructor" && reportData.priority === "critical"
          ? "critical"
          : "medium",
        reasoning: "AI analysis not available",
      };

      if (geminiService.isInitialized()) {
        try {
          aiAnalysis = await geminiService.analyzeContent(
            `Title: ${reportData.title}\nDescription: ${reportData.description}`,
            "categorization"
          );
        } catch (error) {
          console.error("AI categorization failed:", error);
        }
      }

      const report = await Report.create({
        title: reportData.title,
        description: reportData.description,
        reported_by: userId,
        reporter_type: reporterType,
        content_reference: reportData.contentReference || null,
        content_type: reportData.contentType || "general",
        status: "pending",
        priority: reportData.priority || "medium",
        contact_email: reportData.contactEmail || user.email,
        contact_phone: reportData.contactPhone || null,
        attachments: reportData.attachments || null,
        ai_category: aiAnalysis.category,
        ai_severity: aiAnalysis.severity,
        ai_reasoning: aiAnalysis.reasoning,
      });

      return report;
    } catch (error) {
      console.error("Create report error:", error);
      throw error;
    }
  }

  async getReports(filters = {}) {
    try {
      const query = {};

      if (filters.status && filters.status !== "all") {
        query.status = filters.status;
      }

      if (filters.type && filters.type !== "all") {
        query.content_type = filters.type;
      }

      if (filters.severity && filters.severity !== "all") {
        query.ai_severity = filters.severity;
      }

      if (filters.reporterType && filters.reporterType !== "all") {
        query.reporter_type = filters.reporterType;
      }

      if (filters.priority && filters.priority !== "all") {
        query.priority = filters.priority;
      }

      if (filters.dateRange && filters.dateRange !== "all") {
        const now = new Date();
        let startDate;

        switch (filters.dateRange) {
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case "month":
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          query.createdAt = { $gte: startDate };
        }
      }

      if (filters.search) {
        const searchRegex = new RegExp(filters.search, "i");
        query.$or = [
          { title: searchRegex },
          { description: searchRegex },
        ];
      }

      const reports = await Report.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .lean();

      return await Promise.all(
        reports.map(async (report) => {
          let reporter = null;
          let reviewer = null;

          if (report.reported_by) {
            const u = await User.findById(report.reported_by).select("first_name last_name email role").lean();
            if (u) {
              reporter = {
                id: u._id.toString(),
                first_name: u.first_name,
                last_name: u.last_name,
                email: u.email,
                role: u.role,
              };
            }
          }

          if (report.reviewed_by) {
            const rev = await User.findById(report.reviewed_by).select("first_name last_name email").lean();
            if (rev) {
              reviewer = {
                id: rev._id.toString(),
                first_name: rev.first_name,
                last_name: rev.last_name,
                email: rev.email,
              };
            }
          }

          return {
            ...report,
            id: report._id.toString(),
            Reporter: reporter,
            Reviewer: reviewer,
          };
        })
      );
    } catch (error) {
      console.error("Get reports error:", error);
      throw error;
    }
  }

  async getReportById(reportId) {
    try {
      const report = await Report.findById(reportId).lean();

      if (!report) {
        return null;
      }

      let reporter = null;
      let reviewer = null;

      if (report.reported_by) {
        const u = await User.findById(report.reported_by).select("first_name last_name email").lean();
        if (u) {
          reporter = {
            id: u._id.toString(),
            first_name: u.first_name,
            last_name: u.last_name,
            email: u.email,
          };
        }
      }

      if (report.reviewed_by) {
        const rev = await User.findById(report.reviewed_by).select("first_name last_name email").lean();
        if (rev) {
          reviewer = {
            id: rev._id.toString(),
            first_name: rev.first_name,
            last_name: rev.last_name,
            email: rev.email,
          };
        }
      }

      let contentDetails = null;
      if (report.content_reference && report.content_type !== "general") {
        try {
          switch (report.content_type) {
            case "course":
              contentDetails = await Course.findById(report.content_reference)
                .select("title description")
                .lean();
              break;
            case "lesson":
              contentDetails = await Lesson.findById(report.content_reference)
                .select("title content")
                .lean();
              break;
            case "quiz":
              contentDetails = await Quiz.findById(report.content_reference)
                .select("title")
                .lean();
              break;
          }
        } catch (error) {
          console.error("Error fetching content details:", error);
        }
      }

      return {
        ...report,
        id: report._id.toString(),
        Reporter: reporter,
        Reviewer: reviewer,
        contentDetails,
      };
    } catch (error) {
      console.error("Get report by ID error:", error);
      throw error;
    }
  }

  async updateReportStatus(reportId, status, adminId) {
    try {
      const report = await Report.findById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      report.status = status;
      report.reviewed_by = adminId;
      report.reviewed_at = new Date();

      await report.save();
      return report;
    } catch (error) {
      console.error("Update report status error:", error);
      throw error;
    }
  }

  async getAISummary(reportId) {
    try {
      const report = await this.getReportById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      if (!geminiService.isInitialized()) {
        return {
          summary: "AI service not configured",
          recommendations: "Please configure GEMINI_API_KEY to enable AI features",
        };
      }

      const summary = await geminiService.analyzeContent(
        `Report: ${report.title}\n${report.description}`,
        "summary"
      );

      const recommendations = await geminiService.generateSuggestions({
        reportType: report.content_type,
        severity: report.ai_severity,
        category: report.ai_category,
        description: report.description,
      });

      return { summary, recommendations };
    } catch (error) {
      console.error("Get AI summary error:", error);
      throw error;
    }
  }

  async getAIActionRecommendations(reportId) {
    try {
      const report = await this.getReportById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      if (!geminiService.isInitialized()) {
        return {
          reportId: report.id,
          severity: report.ai_severity || "medium",
          priority: 3,
          recommendedActions: [
            {
              action: "Review manually",
              reasoning: "AI service not configured",
              impact: "Manual review required",
              requiresConfirmation: true,
              canBeAutomated: false,
            },
          ],
          similarCases: {
            description: "AI analysis not available",
            examples: [],
          },
        };
      }

      const analysis = await geminiService.analyzeReportForActions(report);

      const similarReports = await Report.find({
        ai_category: report.ai_category,
        status: "resolved",
        _id: { $ne: reportId },
      })
        .limit(5)
        .select("_id id title status")
        .lean();

      return {
        reportId: report.id,
        severity: analysis.severity,
        priority: analysis.priority,
        recommendedActions: (analysis.actions || []).map((action) => ({
          ...action,
          requiresConfirmation: true,
          canBeAutomated: false,
        })),
        similarCases: {
          description: analysis.similarCases,
          examples: similarReports.map(r => ({ id: r._id.toString(), title: r.title, status: r.status })),
        },
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Get AI action recommendations error:", error);
      throw error;
    }
  }

  async addInternalNote(reportId, note, adminId) {
    try {
      const report = await Report.findById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      const currentNotes = report.internal_notes || "";
      const timestamp = new Date().toISOString();
      const admin = await User.findById(adminId).select("first_name last_name").lean();
      const adminName = admin ? `${admin.first_name} ${admin.last_name}` : "Admin";

      const newNote = `[${timestamp}] ${adminName}: ${note}\n`;
      report.internal_notes = currentNotes + newNote;

      await report.save();
      return report;
    } catch (error) {
      console.error("Add internal note error:", error);
      throw error;
    }
  }

  async resolveReport(reportId, resolutionDetails, adminId) {
    try {
      const report = await Report.findById(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      report.status = "resolved";
      report.resolution_details = resolutionDetails;
      report.reviewed_by = adminId;
      report.reviewed_at = new Date();

      await report.save();
      return report;
    } catch (error) {
      console.error("Resolve report error:", error);
      throw error;
    }
  }

  async getReportStats() {
    try {
      const totalReports = await Report.countDocuments();
      const pendingReports = await Report.countDocuments({ status: "pending" });
      const inReviewReports = await Report.countDocuments({ status: "in-review" });
      const resolvedReports = await Report.countDocuments({ status: "resolved" });

      const criticalReports = await Report.countDocuments({
        ai_severity: "critical",
        status: { $ne: "resolved" },
      });

      const highSeverityReports = await Report.countDocuments({
        ai_severity: "high",
        status: { $ne: "resolved" },
      });

      const studentReports = await Report.countDocuments({ reporter_type: "student" });
      const instructorReports = await Report.countDocuments({ reporter_type: "instructor" });

      const resolvedWithTime = await Report.find({
        status: "resolved",
        reviewed_at: { $ne: null },
      })
        .select("createdAt created_at reviewed_at")
        .lean();

      let avgResolutionTime = 0;
      if (resolvedWithTime.length > 0) {
        const totalTime = resolvedWithTime.reduce((sum, report) => {
          const created = new Date(report.createdAt || report.created_at);
          const diff = new Date(report.reviewed_at) - created;
          return sum + diff;
        }, 0);
        avgResolutionTime = Math.round(totalTime / resolvedWithTime.length / (1000 * 60 * 60));
      }

      return {
        total: totalReports,
        pending: pendingReports,
        inReview: inReviewReports,
        resolved: resolvedReports,
        critical: criticalReports,
        highSeverity: highSeverityReports,
        byReporterType: {
          student: studentReports,
          instructor: instructorReports,
        },
        avgResolutionTimeHours: avgResolutionTime,
      };
    } catch (error) {
      console.error("Get report stats error:", error);
      throw error;
    }
  }
}

export default new ReportService();
