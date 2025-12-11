import models from "../../models/index.js";
import geminiService from "../ai/gemini.service.js";
import { Op } from "sequelize";

const { Report, User, Course, Lesson, Quiz } = models;

class ReportService {
  async createReport(reportData, userId) {
    try {
      
      const user = await User.findByPk(userId, {
        attributes: ["id", "first_name", "last_name", "email", "role"],
      });

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
      const where = {};

      if (filters.status && filters.status !== "all") {
        where.status = filters.status;
      }

      if (filters.type && filters.type !== "all") {
        where.content_type = filters.type;
      }

      if (filters.severity && filters.severity !== "all") {
        where.ai_severity = filters.severity;
      }

      if (filters.reporterType && filters.reporterType !== "all") {
        where.reporter_type = filters.reporterType;
      }

      if (filters.priority && filters.priority !== "all") {
        where.priority = filters.priority;
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
          where.created_at = {
            [Op.gte]: startDate,
          };
        }
      }

      if (filters.search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } },
        ];
      }

      const reports = await Report.findAll({
        where,
        include: [
          {
            model: User,
            as: "Reporter",
            attributes: ["id", "first_name", "last_name", "email", "role"],
          },
          {
            model: User,
            as: "Reviewer",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false,
          },
        ],
        order: [
          ["priority", "DESC"], 
          ["created_at", "DESC"]
        ],
      });

      return reports;
    } catch (error) {
      console.error("Get reports error:", error);
      throw error;
    }
  }

  async getReportById(reportId) {
    try {
      const report = await Report.findByPk(reportId, {
        include: [
          {
            model: User,
            as: "Reporter",
            attributes: ["id", "first_name", "last_name", "email"],
          },
          {
            model: User,
            as: "Reviewer",
            attributes: ["id", "first_name", "last_name", "email"],
            required: false,
          },
        ],
      });

      if (!report) {
        return null;
      }

      
      if (report.content_reference && report.content_type !== "general") {
        let contentDetails = null;

        try {
          switch (report.content_type) {
            case "course":
              contentDetails = await Course.findByPk(report.content_reference, {
                attributes: ["id", "title", "description"],
              });
              break;
            case "lesson":
              contentDetails = await Lesson.findByPk(report.content_reference, {
                attributes: ["id", "title", "content"],
              });
              break;
            case "quiz":
              contentDetails = await Quiz.findByPk(report.content_reference, {
                attributes: ["id", "title"],
              });
              break;
          }

          if (contentDetails) {
            report.dataValues.contentDetails = contentDetails;
          }
        } catch (error) {
          console.error("Error fetching content details:", error);
        }
      }

      return report;
    } catch (error) {
      console.error("Get report by ID error:", error);
      throw error;
    }
  }

  async updateReportStatus(reportId, status, adminId) {
    try {
      const report = await Report.findByPk(reportId);

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

      
      const similarReports = await Report.findAll({
        where: {
          ai_category: report.ai_category,
          status: "resolved",
          id: { [Op.ne]: reportId },
        },
        limit: 5,
        attributes: ["id", "title", "status"],
      });

      return {
        reportId: report.id,
        severity: analysis.severity,
        priority: analysis.priority,
        recommendedActions: analysis.actions.map((action) => ({
          ...action,
          requiresConfirmation: true, 
          canBeAutomated: false, 
        })),
        similarCases: {
          description: analysis.similarCases,
          examples: similarReports,
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
      const report = await Report.findByPk(reportId);

      if (!report) {
        throw new Error("Report not found");
      }

      const currentNotes = report.internal_notes || "";
      const timestamp = new Date().toISOString();
      const admin = await User.findByPk(adminId, { attributes: ["first_name", "last_name"] });
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
      const report = await Report.findByPk(reportId);

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
      const totalReports = await Report.count();
      const pendingReports = await Report.count({ where: { status: "pending" } });
      const inReviewReports = await Report.count({ where: { status: "in-review" } });
      const resolvedReports = await Report.count({ where: { status: "resolved" } });

      const criticalReports = await Report.count({
        where: { ai_severity: "critical", status: { [Op.ne]: "resolved" } },
      });

      const highSeverityReports = await Report.count({
        where: { ai_severity: "high", status: { [Op.ne]: "resolved" } },
      });

      
      const studentReports = await Report.count({ where: { reporter_type: "student" } });
      const instructorReports = await Report.count({ where: { reporter_type: "instructor" } });

      
      const resolvedWithTime = await Report.findAll({
        where: { 
          status: "resolved",
          reviewed_at: { [Op.ne]: null }
        },
        attributes: ["created_at", "reviewed_at"]
      });

      let avgResolutionTime = 0;
      if (resolvedWithTime.length > 0) {
        const totalTime = resolvedWithTime.reduce((sum, report) => {
          const diff = new Date(report.reviewed_at) - new Date(report.created_at);
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
          instructor: instructorReports
        },
        avgResolutionTimeHours: avgResolutionTime
      };
    } catch (error) {
      console.error("Get report stats error:", error);
      throw error;
    }
  }
}

export default new ReportService();
