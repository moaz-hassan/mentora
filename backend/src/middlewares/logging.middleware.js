

import { addLoggingJob } from "../config/queue.js";


export const logAdminAction = (actionType, resourceType) => {
  return async (req, res, next) => {
    
    const originalSend = res.send;

    
    res.send = function (data) {
      
      res.send = originalSend;

      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        
        addLoggingJob({
          type: "audit",
          data: {
            admin_id: req.user?.id,
            action_type: actionType,
            resource_type: resourceType,
            resource_id: req.params.id || req.body.id || null,
            description: `${actionType} ${resourceType}`,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get("user-agent"),
            status: "success",
            metadata: {
              method: req.method,
              path: req.path,
              query: req.query,
              body: sanitizeBody(req.body)
            }
          }
        }).catch(err => {
          console.error("Failed to queue audit log:", err);
        });
      }

      
      return originalSend.call(this, data);
    };

    next();
  };
};


export const logPaymentAction = async (paymentData) => {
  try {
    await addLoggingJob({
      type: "payment",
      data: {
        transaction_id: paymentData.transactionId,
        user_id: paymentData.userId,
        course_id: paymentData.courseId,
        amount: paymentData.amount,
        currency: paymentData.currency || "USD",
        payment_method: paymentData.paymentMethod,
        status: paymentData.status,
        metadata: paymentData.metadata || {}
      }
    });
  } catch (error) {
    console.error("Failed to queue payment log:", error);
  }
};


export const logEnrollmentAction = async (enrollmentData) => {
  try {
    await addLoggingJob({
      type: "enrollment",
      data: {
        enrollment_id: enrollmentData.enrollmentId,
        user_id: enrollmentData.userId,
        course_id: enrollmentData.courseId,
        status: enrollmentData.status,
        source: enrollmentData.source || "direct",
        payment_status: enrollmentData.paymentStatus,
        metadata: enrollmentData.metadata || {}
      }
    });
  } catch (error) {
    console.error("Failed to queue enrollment log:", error);
  }
};


export const logError = async (errorData) => {
  try {
    await addLoggingJob({
      type: "error",
      data: {
        error_type: errorData.type || "UnknownError",
        error_message: errorData.message,
        stack_trace: errorData.stack,
        severity: errorData.severity || "error",
        endpoint: errorData.endpoint,
        method: errorData.method,
        user_id: errorData.userId || null,
        ip_address: errorData.ipAddress,
        user_agent: errorData.userAgent,
        metadata: errorData.metadata || {}
      }
    });
  } catch (error) {
    console.error("Failed to queue error log:", error);
  }
};


export const logModerationAction = async (moderationData) => {
  try {
    await addLoggingJob({
      type: "moderation",
      data: {
        moderator_id: moderationData.moderatorId,
        action_type: moderationData.actionType,
        content_type: moderationData.contentType,
        content_id: moderationData.contentId,
        reason: moderationData.reason,
        status: moderationData.status,
        metadata: moderationData.metadata || {}
      }
    });
  } catch (error) {
    console.error("Failed to queue moderation log:", error);
  }
};


const sanitizeBody = (body) => {
  if (!body) return {};

  const sanitized = { ...body };
  const sensitiveFields = ["password", "token", "secret", "apiKey", "creditCard"];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
};


export const errorLoggingMiddleware = (err, req, res, next) => {
  
  logError({
    type: err.name || "Error",
    message: err.message,
    stack: err.stack,
    severity: err.statusCode >= 500 ? "critical" : "error",
    endpoint: req.path,
    method: req.method,
    userId: req.user?.id,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get("user-agent"),
    metadata: {
      query: req.query,
      params: req.params,
      body: sanitizeBody(req.body)
    }
  }).catch(console.error);

  
  next(err);
};

export default {
  logAdminAction,
  logPaymentAction,
  logEnrollmentAction,
  logError,
  logModerationAction,
  errorLoggingMiddleware
};
