

import * as logsService from "../../services/admin/logs.service.js";


export const getAuditLogs = async (req, res, next) => {
  try {
    const filters = {
      adminId: req.query.adminId,
      actionType: req.query.actionType,
      resourceType: req.query.resourceType,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await logsService.getAuditLogs(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};


export const getPaymentLogs = async (req, res, next) => {
  try {
    const filters = {
      userId: req.query.userId,
      courseId: req.query.courseId,
      status: req.query.status,
      paymentMethod: req.query.paymentMethod,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      minAmount: req.query.minAmount,
      maxAmount: req.query.maxAmount,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await logsService.getPaymentLogs(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};


export const getEnrollmentLogs = async (req, res, next) => {
  try {
    const filters = {
      userId: req.query.userId,
      courseId: req.query.courseId,
      status: req.query.status,
      source: req.query.source,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await logsService.getEnrollmentLogs(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};


export const getErrorLogs = async (req, res, next) => {
  try {
    const filters = {
      severity: req.query.severity,
      errorType: req.query.errorType,
      userId: req.query.userId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await logsService.getErrorLogs(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};


export const exportLogs = async (req, res, next) => {
  try {
    const { logType, filters } = req.body;

    const csvData = await logsService.exportLogs(logType, filters);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${logType}-logs-${Date.now()}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};


export const getLogAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await logsService.getLogAnalytics({
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};


export const searchAllLogs = async (req, res, next) => {
  try {
    const { q, limit, startDate, endDate } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search term is required"
      });
    }

    const results = await logsService.searchAllLogs(q, {
      limit: limit ? parseInt(limit) : undefined,
      startDate,
      endDate
    });

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
