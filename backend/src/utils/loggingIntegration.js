

import { logPayment, logEnrollment, logModeration, logNotification, logError } from "../services/admin/logs.service.js";


export const logPaymentTransaction = async (paymentData) => {
  try {
    await logPayment({
      transactionId: paymentData.transactionId,
      userId: paymentData.userId,
      courseId: paymentData.courseId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.status,
      metadata: paymentData.metadata
    });
  } catch (error) {
    console.error('Payment logging error:', error);
  }
};


export const logEnrollmentCreation = async (enrollmentData) => {
  try {
    await logEnrollment({
      enrollmentId: enrollmentData.enrollmentId,
      userId: enrollmentData.userId,
      courseId: enrollmentData.courseId,
      status: enrollmentData.status,
      source: enrollmentData.source || 'direct',
      paymentStatus: enrollmentData.paymentStatus,
      metadata: enrollmentData.metadata
    });
  } catch (error) {
    console.error('Enrollment logging error:', error);
  }
};


export const logModerationAction = async (moderationData) => {
  try {
    await logModeration({
      moderatorId: moderationData.moderatorId,
      contentType: moderationData.contentType,
      contentId: moderationData.contentId,
      action: moderationData.action,
      reason: moderationData.reason,
      metadata: moderationData.metadata
    });
  } catch (error) {
    console.error('Moderation logging error:', error);
  }
};


export const logNotificationDelivery = async (notificationData) => {
  try {
    await logNotification({
      adminId: notificationData.adminId,
      title: notificationData.title,
      message: notificationData.message,
      targetAudience: notificationData.targetAudience,
      recipientCount: notificationData.recipientCount,
      deliveredCount: notificationData.deliveredCount,
      failedCount: notificationData.failedCount,
      scheduledAt: notificationData.scheduledAt,
      sentAt: notificationData.sentAt || new Date(),
      status: notificationData.status || 'sent'
    });
  } catch (error) {
    console.error('Notification logging error:', error);
  }
};


export const logApplicationError = async (errorData) => {
  try {
    await logError({
      errorType: errorData.errorType || 'UnknownError',
      errorMessage: errorData.errorMessage,
      stackTrace: errorData.stackTrace,
      severity: errorData.severity || 'error',
      endpoint: errorData.endpoint,
      method: errorData.method,
      userId: errorData.userId,
      ipAddress: errorData.ipAddress,
      userAgent: errorData.userAgent,
      metadata: errorData.metadata
    });
  } catch (error) {
    console.error('Error logging error:', error);
  }
};



export default {
  logPaymentTransaction,
  logEnrollmentCreation,
  logModerationAction,
  logNotificationDelivery,
  logApplicationError
};
