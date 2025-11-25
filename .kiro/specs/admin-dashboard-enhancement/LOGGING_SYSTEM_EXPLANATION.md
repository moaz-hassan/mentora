# Audit Logging System - How It Works

## Overview

The audit logging system is a comprehensive activity tracking mechanism that records all significant actions, transactions, and events across the platform. This ensures accountability, enables troubleshooting, supports compliance, and provides insights into platform usage.

## Architecture

### Database Schema

The logging system uses dedicated tables to store different types of logs:

```sql
-- Main Audit Log Table
CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  admin_id VARCHAR(50) REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(50),
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  before_state JSON,
  after_state JSON,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transaction Logs
CREATE TABLE payment_logs (
  id VARCHAR(50) PRIMARY KEY,
  transaction_id VARCHAR(100) UNIQUE,
  student_id VARCHAR(50) REFERENCES users(id),
  course_id VARCHAR(50) REFERENCES courses(id),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  payment_status VARCHAR(20),
  coupon_code VARCHAR(50),
  discount_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  payment_gateway VARCHAR(50),
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollment Logs
CREATE TABLE enrollment_logs (
  id VARCHAR(50) PRIMARY KEY,
  enrollment_id VARCHAR(50) REFERENCES enrollments(id),
  student_id VARCHAR(50) REFERENCES users(id),
  course_id VARCHAR(50) REFERENCES courses(id),
  action VARCHAR(50) NOT NULL,
  enrollment_source VARCHAR(50),
  payment_status VARCHAR(20),
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content Moderation Logs
CREATE TABLE moderation_logs (
  id VARCHAR(50) PRIMARY KEY,
  moderator_id VARCHAR(50) REFERENCES users(id),
  content_type VARCHAR(50) NOT NULL,
  content_id VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  ai_analysis JSON,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Logs
CREATE TABLE notification_logs (
  id VARCHAR(50) PRIMARY KEY,
  notification_id VARCHAR(50) REFERENCES notifications(id),
  sender_id VARCHAR(50) REFERENCES users(id),
  target_audience VARCHAR(50),
  recipient_count INTEGER,
  delivered_count INTEGER,
  opened_count INTEGER,
  clicked_count INTEGER,
  failed_count INTEGER,
  status VARCHAR(20),
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Error Logs
CREATE TABLE error_logs (
  id VARCHAR(50) PRIMARY KEY,
  error_type VARCHAR(100),
  error_message TEXT,
  stack_trace TEXT,
  user_id VARCHAR(50),
  request_url TEXT,
  request_method VARCHAR(10),
  request_body JSON,
  severity VARCHAR(20),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## How Different Systems Log Activities

### 1. Payment Logging

**When a payment is processed:**

```javascript
// Example: Payment Processing Flow
async function processPayment(studentId, courseId, amount, paymentMethod) {
  const transaction = await db.transaction();
  
  try {
    // 1. Process payment with gateway
    const paymentResult = await paymentGateway.charge({
      amount,
      method: paymentMethod,
      metadata: { studentId, courseId }
    });
    
    // 2. Create payment record
    const payment = await Payment.create({
      student_id: studentId,
      course_id: courseId,
      amount: amount,
      status: paymentResult.status,
      transaction_id: paymentResult.transactionId
    }, { transaction });
    
    // 3. LOG THE PAYMENT
    await PaymentLog.create({
      transaction_id: paymentResult.transactionId,
      student_id: studentId,
      course_id: courseId,
      amount: amount,
      payment_method: paymentMethod,
      payment_status: paymentResult.status,
      final_amount: amount,
      payment_gateway: 'stripe',
      gateway_response: paymentResult.rawResponse
    }, { transaction });
    
    // 4. If successful, create enrollment
    if (paymentResult.status === 'completed') {
      await createEnrollment(studentId, courseId, transaction);
    }
    
    await transaction.commit();
    return { success: true, payment };
    
  } catch (error) {
    await transaction.rollback();
    
    // LOG THE ERROR
    await ErrorLog.create({
      error_type: 'PaymentProcessingError',
      error_message: error.message,
      stack_trace: error.stack,
      user_id: studentId,
      severity: 'high'
    });
    
    throw error;
  }
}
```

**What gets logged:**
- Transaction ID (unique identifier)
- Student and course information
- Payment amount and method
- Payment status (pending, completed, failed, refunded)
- Coupon usage (if applicable)
- Gateway response details
- Timestamp

### 2. Enrollment Logging

**When a student enrolls in a course:**

```javascript
async function createEnrollment(studentId, courseId, transaction) {
  // 1. Create enrollment
  const enrollment = await Enrollment.create({
    student_id: studentId,
    course_id: courseId,
    status: 'active',
    enrolled_at: new Date()
  }, { transaction });
  
  // 2. LOG THE ENROLLMENT
  await EnrollmentLog.create({
    enrollment_id: enrollment.id,
    student_id: studentId,
    course_id: courseId,
    action: 'enrolled',
    enrollment_source: 'purchase',
    payment_status: 'completed',
    new_status: 'active',
    metadata: {
      course_title: enrollment.Course.title,
      student_name: enrollment.Student.first_name
    }
  }, { transaction });
  
  return enrollment;
}

// When enrollment status changes
async function updateEnrollmentStatus(enrollmentId, newStatus, reason) {
  const enrollment = await Enrollment.findByPk(enrollmentId);
  const previousStatus = enrollment.status;
  
  enrollment.status = newStatus;
  await enrollment.save();
  
  // LOG THE STATUS CHANGE
  await EnrollmentLog.create({
    enrollment_id: enrollmentId,
    student_id: enrollment.student_id,
    course_id: enrollment.course_id,
    action: 'status_changed',
    previous_status: previousStatus,
    new_status: newStatus,
    metadata: { reason }
  });
}
```

**What gets logged:**
- Enrollment creation
- Status changes (active, completed, suspended, cancelled)
- Enrollment source (purchase, coupon, admin grant)
- Associated payment information
- Completion progress updates

### 3. Report System Logging

**When a report is submitted or processed:**

```javascript
async function createReport(reporterId, contentType, contentId, data) {
  // 1. Create report
  const report = await Report.create({
    reporter_id: reporterId,
    content_type: contentType,
    content_id: contentId,
    title: data.title,
    description: data.description,
    status: 'pending'
  });
  
  // 2. Get AI analysis
  const aiAnalysis = await analyzeReportWithAI(report);
  
  // 3. Update report with AI insights
  report.ai_severity = aiAnalysis.severity;
  report.ai_category = aiAnalysis.category;
  await report.save();
  
  // 4. LOG THE REPORT SUBMISSION
  await AuditLog.create({
    admin_id: null, // User action, not admin
    action_type: 'report_submitted',
    resource_type: contentType,
    resource_id: contentId,
    description: `Report submitted for ${contentType} #${contentId}`,
    after_state: {
      report_id: report.id,
      severity: aiAnalysis.severity,
      category: aiAnalysis.category
    }
  });
  
  return report;
}

async function updateReportStatus(reportId, adminId, newStatus) {
  const report = await Report.findByPk(reportId);
  const previousStatus = report.status;
  
  report.status = newStatus;
  report.reviewed_by = adminId;
  report.reviewed_at = new Date();
  await report.save();
  
  // LOG THE MODERATION ACTION
  await ModerationLog.create({
    moderator_id: adminId,
    content_type: 'report',
    content_id: reportId,
    action: 'status_updated',
    previous_status: previousStatus,
    new_status: newStatus,
    reason: `Report ${newStatus} by admin`
  });
}
```

**What gets logged:**
- Report submission with AI analysis
- Status changes (pending → in-review → resolved/dismissed)
- Moderator actions
- AI severity and category assignments

### 4. Admin Action Logging

**When an admin performs any action:**

```javascript
// Middleware to automatically log admin actions
async function auditLogMiddleware(req, res, next) {
  // Store original methods
  const originalJson = res.json;
  const originalSend = res.send;
  
  // Override response methods to capture result
  res.json = function(data) {
    logAdminAction(req, res, data);
    return originalJson.call(this, data);
  };
  
  next();
}

async function logAdminAction(req, res, responseData) {
  if (!req.user || req.user.role !== 'admin') return;
  
  const actionMap = {
    'POST /api/admin/courses/:id/approve': 'course_approved',
    'POST /api/admin/courses/:id/reject': 'course_rejected',
    'PATCH /api/admin/users/:id/status': 'user_status_changed',
    'POST /api/notifications': 'notification_sent',
    'POST /api/coupons': 'coupon_created',
    'DELETE /api/courses/:id': 'course_deleted'
  };
  
  const actionType = actionMap[`${req.method} ${req.route.path}`] || 'unknown_action';
  
  await AuditLog.create({
    admin_id: req.user.id,
    action_type: actionType,
    resource_type: extractResourceType(req.route.path),
    resource_id: req.params.id,
    description: generateActionDescription(actionType, req),
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    before_state: req.body.before || null,
    after_state: responseData,
    status: res.statusCode < 400 ? 'success' : 'failed'
  });
}
```

**What gets logged:**
- All admin actions (approve, reject, delete, update)
- Resource being modified
- Before and after states
- IP address and user agent
- Success or failure status

### 5. Notification Logging

**When notifications are sent:**

```javascript
async function sendNotification(adminId, notificationData) {
  // 1. Create notification
  const notification = await Notification.create({
    title: notificationData.title,
    message: notificationData.message,
    target_audience: notificationData.audience,
    sender_id: adminId,
    scheduled_at: notificationData.scheduledAt || new Date()
  });
  
  // 2. Get recipients
  const recipients = await getRecipients(notificationData.audience);
  
  // 3. Send to all recipients
  const results = await Promise.allSettled(
    recipients.map(user => sendToUser(user.id, notification))
  );
  
  // 4. Calculate delivery stats
  const delivered = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  // 5. LOG THE NOTIFICATION
  await NotificationLog.create({
    notification_id: notification.id,
    sender_id: adminId,
    target_audience: notificationData.audience,
    recipient_count: recipients.length,
    delivered_count: delivered,
    failed_count: failed,
    status: 'sent',
    sent_at: new Date()
  });
  
  return notification;
}

// Track engagement
async function trackNotificationEngagement(notificationId, userId, action) {
  const log = await NotificationLog.findOne({
    where: { notification_id: notificationId }
  });
  
  if (action === 'opened') {
    log.opened_count += 1;
  } else if (action === 'clicked') {
    log.clicked_count += 1;
  }
  
  await log.save();
}
```

**What gets logged:**
- Notification creation and sending
- Target audience and recipient count
- Delivery success/failure rates
- Engagement metrics (opens, clicks)
- Scheduled vs actual send time

## Viewing and Analyzing Logs

### Admin Dashboard - Logs Page

The logs page provides:

1. **Unified Log View**: All logs in one place with filtering
2. **Log Type Filters**: Filter by payment, enrollment, moderation, admin actions, etc.
3. **Date Range Selection**: View logs for specific time periods
4. **Search Functionality**: Full-text search across all log fields
5. **Export Options**: Download logs as CSV or JSON
6. **Visual Analytics**: Charts showing activity trends and patterns

### Example Log Queries

```javascript
// Get all payments for a specific course
const courseLogs = await PaymentLog.findAll({
  where: { course_id: courseId },
  order: [['created_at', 'DESC']]
});

// Get admin actions in the last 24 hours
const recentActions = await AuditLog.findAll({
  where: {
    created_at: {
      [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  },
  include: [{ model: User, as: 'Admin' }]
});

// Get failed payments
const failedPayments = await PaymentLog.findAll({
  where: { payment_status: 'failed' },
  include: [
    { model: User, as: 'Student' },
    { model: Course }
  ]
});

// Get enrollment trends
const enrollmentTrends = await EnrollmentLog.findAll({
  where: { action: 'enrolled' },
  attributes: [
    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: [sequelize.fn('DATE', sequelize.col('created_at'))]
});
```

## Benefits of the Logging System

1. **Accountability**: Track who did what and when
2. **Troubleshooting**: Diagnose issues by reviewing event sequences
3. **Compliance**: Meet regulatory requirements for audit trails
4. **Analytics**: Understand platform usage patterns
5. **Security**: Detect suspicious activities and unauthorized access
6. **Performance**: Identify bottlenecks and optimization opportunities
7. **Customer Support**: Resolve user issues with complete transaction history

## Data Retention

- **Audit Logs**: Retained for 2 years
- **Payment Logs**: Retained for 7 years (tax/legal requirements)
- **Enrollment Logs**: Retained for 5 years
- **Error Logs**: Retained for 1 year
- **Notification Logs**: Retained for 1 year

Older logs are archived to cold storage for compliance but not actively queryable.
