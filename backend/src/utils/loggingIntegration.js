/**
 * Logging Integration Utilities
 * Purpose: Helper functions to integrate logging across the application
 * Usage: Import and call these functions in controllers/services
 */

import { logPayment, logEnrollment, logModeration, logNotification, logError } from "../services/admin/logs.service.js";

/**
 * Log payment transaction
 * Call this after payment processing
 * 
 * @example
 * await logPaymentTransaction({
 *   transactionId: payment.transaction_id,
 *   userId: payment.user_id,
 *   courseId: payment.course_id,
 *   amount: payment.amount,
 *   paymentMethod: payment.payment_method,
 *   status: payment.status
 * });
 */
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

/**
 * Log enrollment creation
 * Call this after enrollment is created
 * 
 * @example
 * await logEnrollmentCreation({
 *   enrollmentId: enrollment.id,
 *   userId: enrollment.user_id,
 *   courseId: enrollment.course_id,
 *   status: enrollment.status,
 *   source: 'direct',
 *   paymentStatus: 'completed'
 * });
 */
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

/**
 * Log content moderation action
 * Call this after course/chapter approval/rejection
 * 
 * @example
 * await logModerationAction({
 *   moderatorId: req.user.id,
 *   contentType: 'course',
 *   contentId: course.id,
 *   action: 'approved',
 *   reason: 'Meets quality standards'
 * });
 */
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

/**
 * Log notification delivery
 * Call this after notification is sent
 * 
 * @example
 * await logNotificationDelivery({
 *   adminId: req.user.id,
 *   title: 'System Update',
 *   message: 'Platform maintenance scheduled',
 *   targetAudience: 'all',
 *   recipientCount: 1000,
 *   deliveredCount: 998,
 *   failedCount: 2
 * });
 */
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

/**
 * Log application error
 * Call this in error handlers
 * 
 * @example
 * await logApplicationError({
 *   errorType: 'DatabaseError',
 *   errorMessage: error.message,
 *   stackTrace: error.stack,
 *   severity: 'error',
 *   endpoint: req.path,
 *   method: req.method,
 *   userId: req.user?.id,
 *   ipAddress: req.ip
 * });
 */
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

/**
 * Integration Instructions:
 * 
 * 1. PAYMENT LOGGING:
 *    In payment.service.js or payment.controller.js, after successful payment:
 *    ```
 *    import { logPaymentTransaction } from '../utils/loggingIntegration.js';
 *    
 *    // After payment is processed
 *    await logPaymentTransaction({
 *      transactionId: payment.transaction_id,
 *      userId: payment.user_id,
 *      courseId: payment.course_id,
 *      amount: payment.amount,
 *      paymentMethod: payment.payment_method,
 *      status: payment.status
 *    });
 *    ```
 * 
 * 2. ENROLLMENT LOGGING:
 *    In enrollment.service.js, after enrollment creation:
 *    ```
 *    import { logEnrollmentCreation } from '../utils/loggingIntegration.js';
 *    
 *    // After enrollment is created
 *    await logEnrollmentCreation({
 *      enrollmentId: enrollment.id,
 *      userId: enrollment.user_id,
 *      courseId: enrollment.course_id,
 *      status: enrollment.status,
 *      source: 'direct',
 *      paymentStatus: 'completed'
 *    });
 *    ```
 * 
 * 3. MODERATION LOGGING:
 *    In course.controller.js, after approval/rejection:
 *    ```
 *    import { logModerationAction } from '../utils/loggingIntegration.js';
 *    
 *    // After course approval
 *    await logModerationAction({
 *      moderatorId: req.user.id,
 *      contentType: 'course',
 *      contentId: course.id,
 *      action: 'approved',
 *      reason: 'Meets quality standards'
 *    });
 *    ```
 * 
 * 4. NOTIFICATION LOGGING:
 *    Already integrated in notification.service.js
 * 
 * 5. ERROR LOGGING:
 *    In error middleware (app.js):
 *    ```
 *    import { logApplicationError } from '../utils/loggingIntegration.js';
 *    
 *    // In error handler
 *    await logApplicationError({
 *      errorType: error.name,
 *      errorMessage: error.message,
 *      stackTrace: error.stack,
 *      severity: 'error',
 *      endpoint: req.path,
 *      method: req.method,
 *      userId: req.user?.id,
 *      ipAddress: req.ip
 *    });
 *    ```
 */

export default {
  logPaymentTransaction,
  logEnrollmentCreation,
  logModerationAction,
  logNotificationDelivery,
  logApplicationError
};
