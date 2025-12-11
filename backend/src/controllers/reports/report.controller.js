import reportService from "../../services/reports/report.service.js";

export const createReport = async (req, res) => {
  try {
    const { title, description, contentReference, contentType } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: "Title and description are required",
      });
    }

    const report = await reportService.createReport(
      {
        title,
        description,
        contentReference,
        contentType,
      },
      req.user.id
    );

    res.status(201).json({
      success: true,
      report,
      message: "Report submitted successfully",
      referenceNumber: report.id,
    });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to submit report",
    });
  }
};

export const getReports = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      severity: req.query.severity,
      dateRange: req.query.dateRange,
      search: req.query.search,
      reporterType: req.query.reporterType, 
      priority: req.query.priority, 
    };

    const reports = await reportService.getReports(filters);

    res.json({
      success: true,
      reports,
      count: reports.length,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reports",
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: "Report not found",
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get report by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch report",
    });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const validStatuses = ["pending", "in-review", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value",
      });
    }

    const report = await reportService.updateReportStatus(
      req.params.id,
      status,
      req.user.id
    );

    res.json({
      success: true,
      report,
      message: "Report status updated successfully",
    });
  } catch (error) {
    console.error("Update report status error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update report",
    });
  }
};

export const getAISummary = async (req, res) => {
  try {
    const summary = await reportService.getAISummary(req.params.id);

    res.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error("Get AI summary error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate AI summary",
    });
  }
};

export const getAIActionRecommendations = async (req, res) => {
  try {
    const recommendations = await reportService.getAIActionRecommendations(
      req.params.id
    );

    res.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Get AI action recommendations error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate recommendations",
    });
  }
};

export const getReportStats = async (req, res) => {
  try {
    const stats = await reportService.getReportStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get report stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch report statistics",
    });
  }
};


export const addInternalNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Note content is required",
      });
    }

    const report = await reportService.addInternalNote(
      req.params.id,
      note,
      req.user.id
    );

    res.json({
      success: true,
      report,
      message: "Internal note added successfully",
    });
  } catch (error) {
    console.error("Add internal note error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add internal note",
    });
  }
};


export const resolveReport = async (req, res) => {
  try {
    const { resolutionDetails, notifyReporter } = req.body;

    if (!resolutionDetails || resolutionDetails.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Resolution details are required",
      });
    }

    const report = await reportService.resolveReport(
      req.params.id,
      resolutionDetails,
      req.user.id,
      notifyReporter !== false 
    );

    res.json({
      success: true,
      report,
      message: "Report resolved successfully",
    });
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to resolve report",
    });
  }
};


export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const report = await reportService.addAttachment(
      req.params.id,
      req.file,
      req.user.id
    );

    res.json({
      success: true,
      report,
      message: "Attachment uploaded successfully",
    });
  } catch (error) {
    console.error("Upload attachment error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload attachment",
    });
  }
};


export const getReportAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await reportService.getReportAnalytics({
      startDate,
      endDate,
    });

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get report analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch report analytics",
    });
  }
};
