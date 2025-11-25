# Admin Dashboard Enhancement - Design Document

## Overview

This design document outlines the technical architecture for enhancing the admin dashboard with comprehensive platform management features. The enhancement includes eight major feature areas: Analytics Dashboard, Category Management, Coupon Management, Financial Dashboard, System Settings, Instructor Management, Enhanced Report System, Marketing Tools with Notifications, Audit Logging, and AI-powered insights across all features.

The design follows a modular architecture with separate frontend pages, backend API routes, and shared services. All features integrate with the existing admin dashboard layout and leverage AI capabilities for intelligent recommendations and automation.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Admin Dashboard Layout (Existing)             │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Sidebar Navigation with New Menu Items        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Analytics │Categories│ Coupons  │Financial │ Settings │  │
│  │   Page   │   Page   │   Page   │   Page   │   Page   │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │Instructor│ Reports  │Marketing │   Logs   │   AI     │  │
│  │   Page   │   Page   │   Page   │   Page   │ Insights │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Admin Routes (/api/admin/*)              │  │
│  │  - Analytics  - Categories  - Coupons  - Financial   │  │
│  │  - Settings   - Instructors - Reports  - Marketing   │  │
│  │  - Logs       - Notifications                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Services Layer                      │  │
│  │  - Analytics Service    - Category Service            │  │
│  │  - Coupon Service       - Financial Service           │  │
│  │  - Settings Service     - Instructor Service          │  │
│  │  - Report Service       - Marketing Service           │  │
│  │  - Logging Service      - AI Service                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Background Jobs (Bull Queue)             │  │
│  │  - Async Logging      - Notification Delivery         │  │
│  │  - Report Generation  - AI Analysis                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │   PostgreSQL │    Redis     │   Gemini AI          │    │
│  │   (Main DB)  │   (Cache &   │   (AI Insights)      │    │
│  │              │    Queue)    │                      │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- Recharts (for data visualization)
- React Query (for data fetching)
- Lucide React (icons)

**Backend:**
- Node.js with Express
- Sequelize ORM
- PostgreSQL
- Redis (caching and queues)
- Bull (job queue)
- Google Gemini AI (AI features)

**Infrastructure:**
- Asynchronous logging with Bull Queue
- Redis for caching and session management
- Database indexing for performance
- Batch processing for high-volume operations

## Components and Interfaces

### Frontend Components Structure

```
frontend/app/(dashboard)/dashboard/admin/
├── analytics/
│   └── page.js                    # Analytics Dashboard
├── categories/
│   └── page.js                    # Category Management
├── coupons/
│   └── page.js                    # Coupon Management
├── financial/
│   └── page.js                    # Financial Dashboard
├── settings/
│   └── page.js                    # System Settings
├── instructors/
│   └── page.js                    # Instructor Management
├── reports/
│   └── page.js                    # Enhanced Reports (existing, to be updated)
├── marketing/
│   └── page.js                    # Marketing Tools
├── notifications/
│   └── page.js                    # Notification Management
├── logs/
│   └── page.js                    # Audit Logs
└── components/
    ├── AnalyticsCard.jsx          # Reusable metric card
    ├── ChartWrapper.jsx           # Chart component wrapper
    ├── DataTable.jsx              # Reusable data table
    ├── FilterBar.jsx              # Common filter component
    ├── ExportButton.jsx           # Export functionality
    ├── AIInsightPanel.jsx         # AI recommendations panel
    └── DateRangePicker.jsx        # Date range selector
```

### Backend API Structure

```
backend/
├── routes/
│   ├── admin.routes.js            # Main admin routes (existing, to be extended)
│   ├── analytics.routes.js        # Analytics endpoints
│   ├── category.routes.js         # Category CRUD (existing, to be extended)
│   ├── coupon.routes.js           # Coupon management
│   ├── financial.routes.js        # Financial operations
│   ├── settings.routes.js         # System settings
│   ├── instructor.routes.js       # Instructor management
│   ├── report.routes.js           # Enhanced reports (existing, to be extended)
│   ├── marketing.routes.js        # Marketing campaigns
│   ├── notification.routes.js     # Notifications (existing, to be extended)
│   └── logs.routes.js             # Audit logs
├── controllers/
│   ├── analytics.controller.js    # Analytics logic
│   ├── category.controller.js     # Category operations
│   ├── coupon.controller.js       # Coupon operations
│   ├── financial.controller.js    # Financial operations
│   ├── settings.controller.js     # Settings management
│   ├── instructor.controller.js   # Instructor operations
│   ├── report.controller.js       # Report handling (to be extended)
│   ├── marketing.controller.js    # Marketing operations
│   ├── notification.controller.js # Notification handling (to be extended)
│   └── logs.controller.js         # Log retrieval
├── services/
│   ├── analytics.service.js       # Analytics calculations
│   ├── category.service.js        # Category business logic
│   ├── coupon.service.js          # Coupon validation & usage
│   ├── financial.service.js       # Financial calculations
│   ├── settings.service.js        # Settings management
│   ├── instructor.service.js      # Instructor analytics
│   ├── report.service.js          # Report processing (to be extended)
│   ├── marketing.service.js       # Campaign management
│   ├── notification.service.js    # Notification delivery (to be extended)
│   ├── logging.service.js         # Async logging
│   └── ai.service.js              # AI integrations
├── models/
│   ├── category.model.js          # Category model (existing)
│   ├── coupon.model.js            # Coupon model (existing)
│   ├── auditLog.model.js          # Audit log model
│   ├── paymentLog.model.js        # Payment log model
│   ├── enrollmentLog.model.js     # Enrollment log model
│   ├── moderationLog.model.js     # Moderation log model
│   ├── notificationLog.model.js   # Notification log model
│   ├── errorLog.model.js          # Error log model
│   ├── settings.model.js          # Settings model
│   ├── campaign.model.js          # Marketing campaign model
│   └── featuredCourse.model.js    # Featured courses model
└── jobs/
    ├── logging.job.js             # Async log processing
    ├── notification.job.js        # Notification delivery
    ├── analytics.job.js           # Analytics aggregation
    └── ai.job.js                  # AI analysis tasks
```

## Data Models

### New Database Models

#### 1. Audit Log Model

```javascript
const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  admin_id: {
    type: DataTypes.STRING(50),
    references: { model: 'users', key: 'id' }
  },
  action_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  resource_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  resource_id: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.TEXT
  },
  before_state: {
    type: DataTypes.JSON
  },
  after_state: {
    type: DataTypes.JSON
  },
  status: {
    type: DataTypes.STRING(20)
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['created_at'] },
    { fields: ['action_type'] },
    { fields: ['resource_type', 'resource_id'] }
  ]
});
```

#### 2. Payment Log Model

```javascript
const PaymentLog = sequelize.define('PaymentLog', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    unique: true
  },
  student_id: {
    type: DataTypes.STRING(50),
    references: { model: 'users', key: 'id' }
  },
  course_id: {
    type: DataTypes.STRING(50),
    references: { model: 'courses', key: 'id' }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  payment_method: {
    type: DataTypes.STRING(50)
  },
  payment_status: {
    type: DataTypes.STRING(20)
  },
  coupon_code: {
    type: DataTypes.STRING(50)
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  final_amount: {
    type: DataTypes.DECIMAL(10, 2)
  },
  payment_gateway: {
    type: DataTypes.STRING(50)
  },
  gateway_response: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'payment_logs',
  timestamps: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['course_id'] },
    { fields: ['created_at'] },
    { fields: ['payment_status'] }
  ]
});
```

#### 3. Enrollment Log Model

```javascript
const EnrollmentLog = sequelize.define('EnrollmentLog', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  enrollment_id: {
    type: DataTypes.STRING(50),
    references: { model: 'enrollments', key: 'id' }
  },
  student_id: {
    type: DataTypes.STRING(50),
    references: { model: 'users', key: 'id' }
  },
  course_id: {
    type: DataTypes.STRING(50),
    references: { model: 'courses', key: 'id' }
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  enrollment_source: {
    type: DataTypes.STRING(50)
  },
  payment_status: {
    type: DataTypes.STRING(20)
  },
  previous_status: {
    type: DataTypes.STRING(20)
  },
  new_status: {
    type: DataTypes.STRING(20)
  },
  metadata: {
    type: DataTypes.JSON
  }
}, {
  tableName: 'enrollment_logs',
  timestamps: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['course_id'] },
    { fields: ['created_at'] }
  ]
});
```

#### 4. Settings Model

```javascript
const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  key: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT
  },
  category: {
    type: DataTypes.STRING(50)
  },
  description: {
    type: DataTypes.TEXT
  },
  data_type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'settings',
  timestamps: true
});
```

#### 5. Campaign Model

```javascript
const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  campaign_type: {
    type: DataTypes.ENUM('featured_courses', 'banner', 'email', 'notification'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'completed'),
    defaultValue: 'draft'
  },
  start_date: {
    type: DataTypes.DATE
  },
  end_date: {
    type: DataTypes.DATE
  },
  target_audience: {
    type: DataTypes.ENUM('all', 'students', 'instructors'),
    defaultValue: 'all'
  },
  banner_image_url: {
    type: DataTypes.STRING(500)
  },
  banner_link: {
    type: DataTypes.STRING(500)
  },
  impressions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  conversions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  revenue_generated: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  created_by: {
    type: DataTypes.STRING(50),
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'campaigns',
  timestamps: true
});
```

#### 6. Featured Course Model

```javascript
const FeaturedCourse = sequelize.define('FeaturedCourse', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  course_id: {
    type: DataTypes.STRING(50),
    references: { model: 'courses', key: 'id' },
    allowNull: false
  },
  campaign_id: {
    type: DataTypes.STRING(50),
    references: { model: 'campaigns', key: 'id' }
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featured_until: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'featured_courses',
  timestamps: true
});
```

#### 7. Notification Log Model

```javascript
const NotificationLog = sequelize.define('NotificationLog', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    defaultValue: () => uuidv4()
  },
  notification_id: {
    type: DataTypes.STRING(50),
    references: { model: 'notifications', key: 'id' }
  },
  sender_id: {
    type: DataTypes.STRING(50),
    references: { model: 'users', key: 'id' }
  },
  target_audience: {
    type: DataTypes.STRING(50)
  },
  recipient_count: {
    type: DataTypes.INTEGER
  },
  delivered_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  opened_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  clicked_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failed_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.STRING(20)
  },
  sent_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'notification_logs',
  timestamps: true
});
```

### Enhanced Existing Models

#### Report Model Enhancement

```javascript
// Add new fields to existing Report model
Report.addColumn('reporter_type', {
  type: DataTypes.ENUM('student', 'instructor'),
  defaultValue: 'student'
});

Report.addColumn('priority', {
  type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
  defaultValue: 'medium'
});

Report.addColumn('contact_email', {
  type: DataTypes.STRING(255)
});

Report.addColumn('contact_phone', {
  type: DataTypes.STRING(50)
});

Report.addColumn('attachments', {
  type: DataTypes.JSON
});

Report.addColumn('internal_notes', {
  type: DataTypes.TEXT
});

Report.addColumn('resolution_details', {
  type: DataTypes.TEXT
});
```

#### Coupon Model (Existing - Reference)

```javascript
// Already exists, will be used as-is
const Coupon = sequelize.define('Coupon', {
  id: DataTypes.STRING(50),
  course_id: DataTypes.STRING(50),
  code: DataTypes.STRING(50),
  discount_type: DataTypes.ENUM('percentage', 'fixed'),
  is_active: DataTypes.BOOLEAN,
  discount_value: DataTypes.DECIMAL(10, 2),
  discount_start_date: DataTypes.DATE,
  discount_end_date: DataTypes.DATE,
  used_count: DataTypes.INTEGER,
  max_count: DataTypes.INTEGER
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Analytics Data Completeness
*For any* analytics request, the returned data should contain all required fields (total revenue, user growth, enrollment trends, course performance) with valid non-negative numeric values.
**Validates: Requirements 1.1**

### Property 2: Revenue Calculation Accuracy
*For any* set of payment transactions and time period, calculating revenue for daily, weekly, and monthly periods should sum to the same total when aggregated.
**Validates: Requirements 1.2**

### Property 3: Category Name Validation
*For any* category creation attempt, the system should accept names that are unique and at least 2 characters long, and reject all others.
**Validates: Requirements 2.1**

### Property 4: Category Deletion Protection
*For any* category with associated courses, deletion attempts should fail, while categories without courses should be deletable.
**Validates: Requirements 2.2**

### Property 5: Coupon Required Fields
*For any* coupon creation attempt, the system should require all mandatory fields (code, discount type, value, dates) and reject incomplete submissions.
**Validates: Requirements 3.1**

### Property 6: Percentage Coupon Bounds
*For any* percentage coupon, the discount value should be between 1 and 100 inclusive, rejecting values outside this range.
**Validates: Requirements 3.2**

### Property 7: Coupon Expiration State
*For any* coupon past its end date, the system should mark it as inactive and prevent usage regardless of previous state.
**Validates: Requirements 3.3**

### Property 8: Financial Data Completeness
*For any* financial dashboard request, the response should include total revenue, pending payouts, completed payouts, and commission with valid numeric values.
**Validates: Requirements 4.1**

### Property 9: Revenue Breakdown Consistency
*For any* time period, summing revenue by course should equal summing revenue by instructor should equal total revenue for that period.
**Validates: Requirements 4.2**

### Property 10: Settings Validation and Persistence
*For any* valid settings update, the changes should be immediately queryable and return the new values.
**Validates: Requirements 5.1**

### Property 11: Instructor Data Aggregation
*For any* instructor, their total earnings should equal the sum of all payments for their courses.
**Validates: Requirements 6.1**

### Property 12: Content Approval Workflow
*For any* content approval, the content status should change to published and a notification should be created for the creator.
**Validates: Requirements 7.1**

### Property 13: Content Rejection Validation
*For any* content rejection with a reason less than 10 characters, the system should reject the operation.
**Validates: Requirements 7.2**

### Property 14: Notification Required Fields
*For any* notification creation, the system should require title, message, and target audience, rejecting incomplete submissions.
**Validates: Requirements 8.1**

### Property 15: Notification Delivery Targeting
*For any* notification sent to a target audience, all users matching that audience criteria should receive the notification.
**Validates: Requirements 8.2**

### Property 16: AI Notification Generation
*For any* AI notification request with valid campaign goals, the system should return suggested content with title and message fields.
**Validates: Requirements 8.3**

### Property 17: AI Insights Generation
*For any* analytics dashboard request, AI insights should be generated with summary and trends fields populated.
**Validates: Requirements 9.1**

### Property 18: Revenue Anomaly Detection
*For any* significant revenue change (>20% from previous period), the system should generate an AI alert.
**Validates: Requirements 9.2**

### Property 19: Admin Action Logging Completeness
*For any* admin action, a log entry should be created with admin ID, timestamp, action type, resource type, and status.
**Validates: Requirements 10.1**

### Property 20: Log Query Performance
*For any* log query with proper indexes, response time should be under 1 second for datasets up to 1 million records.
**Validates: Requirements 10.2**

### Property 21: Student Report Required Fields
*For any* student report submission, the system should require report type, content reference, title, and description.
**Validates: Requirements 11.1**

### Property 22: Instructor Report Enhanced Requirements
*For any* instructor report submission, the system should require all student report fields plus contact information and priority level.
**Validates: Requirements 11.2**

### Property 23: Report Data Completeness
*For any* report retrieval, the response should include all fields: reporter role, type, content details, description, contact info, date, and status.
**Validates: Requirements 11.3**

### Property 24: Enrollment Analytics Accuracy
*For any* time period, the sum of new enrollments should equal the difference between total enrollments at period end and period start.
**Validates: Requirements 12.1**

### Property 25: Analytics Export Format
*For any* analytics export request, the system should generate a file in the requested format (PDF, CSV, or Excel) with all data included.
**Validates: Requirements 12.2**

### Property 26: Cross-Feature Data Consistency
*For any* data entity, changes made in one feature should be immediately reflected when queried from another feature.
**Validates: Requirements 13.2**

## Error Handling

### Error Categories

1. **Validation Errors (400)**
   - Invalid input data
   - Missing required fields
   - Constraint violations
   - Format errors

2. **Authentication Errors (401)**
   - Missing or invalid token
   - Expired session

3. **Authorization Errors (403)**
   - Non-admin user attempting admin actions
   - Insufficient permissions

4. **Not Found Errors (404)**
   - Resource doesn't exist
   - Invalid IDs

5. **Conflict Errors (409)**
   - Duplicate entries
   - State conflicts

6. **Server Errors (500)**
   - Database errors
   - External service failures
   - Unexpected exceptions

### Error Response Format

```javascript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Category name must be at least 2 characters",
    field: "name",
    details: {
      provided: "A",
      required: "minimum 2 characters"
    }
  }
}
```

### Error Handling Strategy

```javascript
// Centralized error handler middleware
app.use((error, req, res, next) => {
  // Log error
  logger.error({
    error: error.message,
    stack: error.stack,
    user: req.user?.id,
    path: req.path,
    method: req.method
  });
  
  // Determine error type
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.errors
      }
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});
```

### Graceful Degradation

- **AI Service Failures**: Return cached results or skip AI features
- **Redis Failures**: Fall back to database queries
- **Queue Failures**: Log synchronously as fallback
- **External API Failures**: Show partial data with warnings

## Testing Strategy

### Unit Testing

**Framework**: Jest

**Coverage Areas**:
- Service layer business logic
- Validation functions
- Calculation functions
- Data transformations
- Error handling

**Example Unit Tests**:

```javascript
describe('CouponService', () => {
  describe('validateCouponCode', () => {
    test('should accept valid coupon codes', () => {
      expect(validateCouponCode('SAVE20')).toBe(true);
      expect(validateCouponCode('SUMMER2024')).toBe(true);
    });
    
    test('should reject invalid coupon codes', () => {
      expect(validateCouponCode('')).toBe(false);
      expect(validateCouponCode('a')).toBe(false);
    });
  });
  
  describe('calculateDiscount', () => {
    test('should calculate percentage discount correctly', () => {
      const result = calculateDiscount(100, 'percentage', 20);
      expect(result).toBe(20);
    });
    
    test('should calculate fixed discount correctly', () => {
      const result = calculateDiscount(100, 'fixed', 15);
      expect(result).toBe(15);
    });
  });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property testing library)

**Configuration**: Each property test should run minimum 100 iterations

**Test Tagging Format**: `**Feature: admin-dashboard-enhancement, Property {number}: {property_text}**`

**Example Property Tests**:

```javascript
import fc from 'fast-check';

describe('Property Tests', () => {
  /**
   * Feature: admin-dashboard-enhancement, Property 2: Revenue Calculation Accuracy
   * For any set of payment transactions and time period, calculating revenue 
   * for daily, weekly, and monthly periods should sum to the same total.
   */
  test('revenue calculations are consistent across time periods', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          amount: fc.float({ min: 0, max: 1000 }),
          date: fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') })
        })),
        (payments) => {
          const dailyRevenue = calculateDailyRevenue(payments);
          const weeklyRevenue = calculateWeeklyRevenue(payments);
          const monthlyRevenue = calculateMonthlyRevenue(payments);
          
          const totalFromDaily = Object.values(dailyRevenue).reduce((a, b) => a + b, 0);
          const totalFromWeekly = Object.values(weeklyRevenue).reduce((a, b) => a + b, 0);
          const totalFromMonthly = Object.values(monthlyRevenue).reduce((a, b) => a + b, 0);
          
          // All should equal total payments
          const expectedTotal = payments.reduce((sum, p) => sum + p.amount, 0);
          
          expect(Math.abs(totalFromDaily - expectedTotal)).toBeLessThan(0.01);
          expect(Math.abs(totalFromWeekly - expectedTotal)).toBeLessThan(0.01);
          expect(Math.abs(totalFromMonthly - expectedTotal)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: admin-dashboard-enhancement, Property 6: Percentage Coupon Bounds
   * For any percentage coupon, the discount value should be between 1 and 100.
   */
  test('percentage coupons enforce value bounds', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        (discountValue) => {
          const isValid = discountValue >= 1 && discountValue <= 100;
          const result = validatePercentageCoupon({ discount_value: discountValue });
          
          expect(result.valid).toBe(isValid);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Feature: admin-dashboard-enhancement, Property 9: Revenue Breakdown Consistency
   * For any time period, summing revenue by course should equal summing by instructor.
   */
  test('revenue breakdowns are consistent', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          course_id: fc.string(),
          instructor_id: fc.string(),
          amount: fc.float({ min: 0, max: 1000 })
        })),
        (payments) => {
          const byCourse = groupRevenueByCourse(payments);
          const byInstructor = groupRevenueByInstructor(payments);
          
          const totalByCourse = Object.values(byCourse).reduce((a, b) => a + b, 0);
          const totalByInstructor = Object.values(byInstructor).reduce((a, b) => a + b, 0);
          
          expect(Math.abs(totalByCourse - totalByInstructor)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Framework**: Supertest + Jest

**Coverage Areas**:
- API endpoints
- Database operations
- Authentication/authorization
- File uploads
- External service integration

**Example Integration Tests**:

```javascript
describe('Category API', () => {
  test('POST /api/admin/categories - creates category with valid data', async () => {
    const response = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Web Development' });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('Web Development');
  });
  
  test('POST /api/admin/categories - rejects duplicate names', async () => {
    await Category.create({ name: 'Existing Category' });
    
    const response = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Existing Category' });
    
    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });
});
```

### End-to-End Testing

**Framework**: Playwright

**Coverage Areas**:
- Complete user workflows
- UI interactions
- Data persistence
- Cross-feature integration

**Example E2E Tests**:

```javascript
test('admin can create and use coupon', async ({ page }) => {
  // Login as admin
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Navigate to coupons
  await page.goto('/dashboard/admin/coupons');
  
  // Create coupon
  await page.click('text=Create Coupon');
  await page.fill('[name="code"]', 'TEST20');
  await page.selectOption('[name="discount_type"]', 'percentage');
  await page.fill('[name="discount_value"]', '20');
  await page.click('button:has-text("Save")');
  
  // Verify coupon appears in list
  await expect(page.locator('text=TEST20')).toBeVisible();
});
```

### Performance Testing

**Tools**: Artillery, k6

**Metrics**:
- Response time < 200ms for 95th percentile
- Throughput > 1000 requests/second
- Error rate < 0.1%
- Database query time < 100ms

**Example Load Test**:

```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load
scenarios:
  - name: 'Admin Analytics'
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'admin@test.com'
            password: 'password'
          capture:
            - json: '$.token'
              as: 'token'
      - get:
          url: '/api/admin/analytics/overview'
          headers:
            Authorization: 'Bearer {{ token }}'
```

## AI Integration

### AI Service Architecture

**Note**: Uses existing `geminiService` from `backend/services/gemini.service.js` which uses `@google/genai` package with `gemini-2.5-flash` model.

```javascript
// Extend existing geminiService for admin dashboard features
import geminiService from './gemini.service.js';

class AdminAIService {
  async generateAnalyticsSummary(analyticsData) {
    const prompt = `Analyze the following platform analytics and provide a concise summary:
- Total Revenue: $${analyticsData.totalRevenue}
- Revenue Change: ${analyticsData.revenueChange}%
- New Users: ${analyticsData.newUsers}
- New Enrollments: ${analyticsData.newEnrollments}

Provide:
1. Key insights (2-3 sentences)
2. Notable trends
3. Recommended actions`;
    
    const response = await geminiService.ai.models.generateContent({
      model: geminiService.model,
      contents: prompt
    });
    
    return response.text;
  }
  
  async detectAnomalies(timeSeriesData) {
    // Calculate statistical anomalies
    const mean = this.calculateMean(timeSeriesData);
    const stdDev = this.calculateStdDev(timeSeriesData);
    
    const anomalies = timeSeriesData.filter(point => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      return zScore > 2; // 2 standard deviations
    });
    
    if (anomalies.length === 0) return null;
    
    // Get AI explanation
    const prompt = `Detected ${anomalies.length} anomalies in revenue data:
${anomalies.map(a => `${a.date}: $${a.value}`).join('\n')}

Normal range: $${mean - 2*stdDev} - $${mean + 2*stdDev}

Provide possible explanations for these anomalies.`;
    
    const response = await geminiService.ai.models.generateContent({
      model: geminiService.model,
      contents: prompt
    });
    
    return {
      anomalies,
      explanation: response.text
    };
  }
  
  async generateNotificationContent(campaignGoal, targetAudience) {
    const prompt = `Generate a notification for an online learning platform:
- Campaign Goal: ${campaignGoal}
- Target Audience: ${targetAudience}

Provide your response in JSON format:
{
  "title": "engaging title (max 60 characters)",
  "message": "message body (max 200 characters)",
  "cta": "call-to-action"
}`;
    
    const response = await geminiService.ai.models.generateContent({
      model: geminiService.model,
      contents: prompt
    });
    
    return this.parseJSONResponse(response.text);
  }
  
  async suggestCampaignOptimization(campaignData) {
    const prompt = `Analyze this marketing campaign:
- Impressions: ${campaignData.impressions}
- Clicks: ${campaignData.clicks}
- Conversions: ${campaignData.conversions}
- Revenue: $${campaignData.revenue}

Suggest optimizations for:
1. Discount percentage
2. Target audience
3. Campaign timing
4. Featured courses`;
    
    const response = await geminiService.ai.models.generateContent({
      model: geminiService.model,
      contents: prompt
    });
    
    return response.text;
  }
  
  async suggestFeaturedCourses(coursesData, trendsData) {
    const prompt = `Based on platform data, suggest which courses should be featured:

Available Courses:
${coursesData.map(c => `- ${c.title}: ${c.enrollments} enrollments, ${c.rating} rating`).join('\n')}

Current Trends:
${trendsData.map(t => `- ${t.topic}: ${t.searchVolume} searches`).join('\n')}

Provide your response in JSON format:
{
  "recommendations": [
    {
      "course_id": "id",
      "reasoning": "why this course",
      "priority": 1-5
    }
  ]
}`;
    
    const response = await geminiService.ai.models.generateContent({
      model: geminiService.model,
      contents: prompt
    });
    
    return this.parseJSONResponse(response.text);
  }
  
  parseJSONResponse(text) {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return null;
    }
  }
  
  calculateMean(data) {
    return data.reduce((sum, point) => sum + point.value, 0) / data.length;
  }
  
  calculateStdDev(data) {
    const mean = this.calculateMean(data);
    const variance = data.reduce((sum, point) => {
      return sum + Math.pow(point.value - mean, 2);
    }, 0) / data.length;
    return Math.sqrt(variance);
  }
}

export default new AdminAIService();
```

### AI Caching Strategy

```javascript
import Redis from 'ioredis';
import crypto from 'crypto';

class CachedAIService extends AIService {
  constructor() {
    super();
    this.redis = new Redis(process.env.REDIS_URL);
    this.cacheTTL = 3600; // 1 hour
  }
  
  generateCacheKey(prefix, data) {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex');
    return `ai:${prefix}:${hash}`;
  }
  
  async generateAnalyticsSummary(analyticsData) {
    const cacheKey = this.generateCacheKey('summary', analyticsData);
    
    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;
    
    // Generate new with Gemini
    const result = await super.generateAnalyticsSummary(analyticsData);
    
    // Cache result
    await this.redis.setex(cacheKey, this.cacheTTL, result);
    
    return result;
  }
  
  async detectAnomalies(timeSeriesData) {
    const cacheKey = this.generateCacheKey('anomalies', timeSeriesData);
    
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const result = await super.detectAnomalies(timeSeriesData);
    
    if (result) {
      await this.redis.setex(cacheKey, this.cacheTTL, JSON.stringify(result));
    }
    
    return result;
  }
}
```

## Security Considerations

### Authentication & Authorization

- All admin routes require authentication
- Role-based access control (admin role required)
- JWT token validation on every request
- Session management with Redis

### Input Validation

- Sanitize all user inputs
- Validate data types and formats
- Enforce length limits
- Prevent SQL injection with parameterized queries
- Prevent XSS with output encoding

### Data Protection

- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Mask sensitive information in logs
- Implement rate limiting
- CORS configuration for API access

### Audit Trail

- Log all admin actions
- Track IP addresses and user agents
- Monitor for suspicious patterns
- Retain logs for compliance

## Performance Optimization

### Database Optimization

1. **Indexing Strategy**
   - Index all foreign keys
   - Composite indexes for common queries
   - Partial indexes for filtered queries

2. **Query Optimization**
   - Use eager loading to prevent N+1 queries
   - Implement pagination for large datasets
   - Use database views for complex aggregations

3. **Connection Pooling**
   - Configure appropriate pool size
   - Monitor connection usage
   - Implement connection retry logic

### Caching Strategy

1. **Redis Caching**
   - Cache frequently accessed data
   - Cache AI responses
   - Cache aggregated analytics
   - Implement cache invalidation

2. **Cache Layers**
   - Application-level caching
   - Database query caching
   - CDN for static assets

### Asynchronous Processing

1. **Background Jobs**
   - Async logging with Bull Queue
   - Notification delivery in background
   - Report generation as jobs
   - AI analysis as async tasks

2. **Job Priorities**
   - Critical: Payment logging
   - High: Notifications
   - Medium: Analytics aggregation
   - Low: Report generation

## Deployment Strategy

### Environment Configuration

```javascript
// config/environments.js
module.exports = {
  development: {
    database: process.env.DEV_DATABASE_URL,
    redis: process.env.DEV_REDIS_URL,
    logLevel: 'debug',
    aiEnabled: true
  },
  staging: {
    database: process.env.STAGING_DATABASE_URL,
    redis: process.env.STAGING_REDIS_URL,
    logLevel: 'info',
    aiEnabled: true
  },
  production: {
    database: process.env.DATABASE_URL,
    redis: process.env.REDIS_URL,
    logLevel: 'error',
    aiEnabled: true,
    cacheTTL: 3600
  }
};
```

### Database Migrations

```javascript
// migrations/YYYYMMDDHHMMSS-create-audit-logs.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true
      },
      admin_id: {
        type: Sequelize.STRING(50),
        references: { model: 'users', key: 'id' }
      },
      action_type: Sequelize.STRING(100),
      resource_type: Sequelize.STRING(50),
      resource_id: Sequelize.STRING(50),
      description: Sequelize.TEXT,
      ip_address: Sequelize.STRING(45),
      user_agent: Sequelize.TEXT,
      before_state: Sequelize.JSON,
      after_state: Sequelize.JSON,
      status: Sequelize.STRING(20),
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
    
    // Add indexes
    await queryInterface.addIndex('audit_logs', ['admin_id']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
    await queryInterface.addIndex('audit_logs', ['action_type']);
  },
  
  down: async (queryInterface) => {
    await queryInterface.dropTable('audit_logs');
  }
};
```

### Monitoring & Logging

- Application logs with Winston
- Error tracking with Sentry
- Performance monitoring with New Relic
- Database monitoring with pg_stat_statements
- Redis monitoring with Redis Insights

## Future Enhancements

1. **Advanced Analytics**
   - Predictive analytics for enrollment trends
   - Student churn prediction
   - Course recommendation engine

2. **Enhanced AI Features**
   - Automated content quality scoring
   - Intelligent pricing recommendations
   - Personalized marketing campaigns

3. **Mobile Admin App**
   - React Native mobile application
   - Push notifications for critical alerts
   - Offline capability for viewing reports

4. **Advanced Reporting**
   - Custom report builder
   - Scheduled report delivery
   - Interactive dashboards

5. **Integration Capabilities**
   - Webhook support for external systems
   - REST API for third-party integrations
   - Export to business intelligence tools
