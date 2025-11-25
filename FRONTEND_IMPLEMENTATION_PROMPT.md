# Frontend Implementation Prompt for Admin Dashboard

## 🎯 OBJECTIVE
Implement all admin dashboard frontend pages (Tasks 6.1-6.13) for the Admin Dashboard Enhancement feature, connecting them to the existing backend API endpoints.

## 📋 CONTEXT SUMMARY FOR NEW CHAT

**Project**: Online Courses Platform - Admin Dashboard Enhancement

**What's Already Complete:**
- ✅ All backend services (analytics, notifications, logs, platform analytics, financial, settings, instructor management, marketing)
- ✅ All backend controllers (68 API endpoints)
- ✅ All admin routes configured at `/api/admin/*`
- ✅ Redis and Bull queue infrastructure for caching and async jobs
- ✅ Database models for all features
- ✅ Authentication and authorization middleware

**What Needs Implementation:**
- 🔄 Frontend admin dashboard pages (13 pages)
- 🔄 Shared UI components
- 🔄 API integration layer
- 🔄 State management for admin features

**Tech Stack:**
- Frontend: Next.js 14+ (App Router)
- UI: React, Tailwind CSS, shadcn/ui components
- State: React hooks, Context API (or Zustand if needed)
- API: Fetch/Axios with authentication

## 📁 PROJECT STRUCTURE

```
frontend/
├── app/
│   └── dashboard/
│       └── admin/
│           ├── analytics/page.js          # Task 6.2
│           ├── categories/page.js         # Task 6.3
│           ├── coupons/page.js           # Task 6.4
│           ├── financial/page.js         # Task 6.5
│           ├── settings/page.js          # Task 6.6
│           ├── instructors/page.js       # Task 6.7
│           ├── reports/page.js           # Task 6.8
│           ├── marketing/page.js         # Task 6.9
│           ├── notifications/page.js     # Task 6.10
│           ├── logs/page.js              # Task 6.11
│           └── platform-analytics/page.js # Task 6.12
├── components/
│   └── admin/
│       ├── shared/                       # Task 6.1
│       │   ├── AnalyticsCard.jsx
│       │   ├── ChartWrapper.jsx
│       │   ├── DataTable.jsx
│       │   ├── FilterBar.jsx
│       │   ├── ExportButton.jsx
│       │   ├── AIInsightPanel.jsx
│       │   └── DateRangePicker.jsx
│       ├── analytics/
│       ├── categories/
│       ├── coupons/
│       ├── financial/
│       ├── settings/
│       ├── instructors/
│       ├── reports/
│       ├── marketing/
│       ├── notifications/
│       ├── logs/
│       └── platform-analytics/
├── lib/
│   └── api/
│       └── admin/
│           ├── analytics.js
│           ├── categories.js
│           ├── coupons.js
│           ├── financial.js
│           ├── settings.js
│           ├── instructors.js
│           ├── reports.js
│           ├── marketing.js
│           ├── notifications.js
│           ├── logs.js
│           └── platformAnalytics.js
└── hooks/
    └── admin/
        ├── useAnalytics.js
        ├── useCategories.js
        ├── useCoupons.js
        └── ... (one per feature)
```

## 🔌 AVAILABLE API ENDPOINTS

### Analytics (6 endpoints)
- `GET /api/admin/analytics/overview`
- `GET /api/admin/analytics/revenue`
- `GET /api/admin/analytics/users`
- `GET /api/admin/analytics/enrollments`
- `GET /api/admin/analytics/courses`
- `POST /api/admin/analytics/export`

### Categories (5 endpoints)
- `GET /api/admin/categories`
- `GET /api/admin/categories/search?q=term`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

### Coupons (9 endpoints)
- `GET /api/admin/coupons`
- `GET /api/admin/coupons/search?q=term&status=active`
- `GET /api/admin/coupons/analytics`
- `GET /api/admin/coupons/:id/analytics`
- `POST /api/admin/coupons`
- `PUT /api/admin/coupons/:id`
- `PATCH /api/admin/coupons/:id/status`
- `DELETE /api/admin/coupons/:id`
- `POST /api/admin/coupons/deactivate-expired`

### Financial (6 endpoints)
- `GET /api/admin/financial/overview`
- `GET /api/admin/financial/revenue`
- `GET /api/admin/financial/payouts`
- `POST /api/admin/financial/payouts/:id/process`
- `GET /api/admin/financial/transactions`
- `POST /api/admin/financial/export`

### Settings (5 endpoints)
- `GET /api/admin/settings`
- `GET /api/admin/settings/:category`
- `POST /api/admin/settings`
- `PUT /api/admin/settings/:key`
- `POST /api/admin/settings/bulk`

### Instructor Management (5 endpoints)
- `GET /api/admin/instructors`
- `GET /api/admin/instructors/:id`
- `GET /api/admin/instructors/:id/analytics`
- `PATCH /api/admin/instructors/:id/status`
- `GET /api/admin/instructors/:id/payouts`

### Marketing (11 endpoints)
- `GET /api/admin/marketing/campaigns`
- `GET /api/admin/marketing/campaigns/:id`
- `GET /api/admin/marketing/campaigns/:id/analytics`
- `POST /api/admin/marketing/campaigns`
- `PUT /api/admin/marketing/campaigns/:id`
- `PATCH /api/admin/marketing/campaigns/:id/metrics`
- `DELETE /api/admin/marketing/campaigns/:id`
- `GET /api/admin/marketing/featured-courses`
- `POST /api/admin/marketing/featured-courses`
- `PUT /api/admin/marketing/featured-courses/:id`
- `DELETE /api/admin/marketing/featured-courses/:id`

### Notifications (7 endpoints)
- `POST /api/admin/notifications/broadcast`
- `GET /api/admin/notifications/history`
- `GET /api/admin/notifications/statistics`
- `GET /api/admin/notifications/scheduled`
- `GET /api/admin/notifications/:id/metrics`
- `POST /api/admin/notifications/:id/send`
- `DELETE /api/admin/notifications/:id/cancel`

### Logs (7 endpoints)
- `GET /api/admin/logs/audit`
- `GET /api/admin/logs/payments`
- `GET /api/admin/logs/enrollments`
- `GET /api/admin/logs/errors`
- `GET /api/admin/logs/analytics`
- `GET /api/admin/logs/search?q=term`
- `POST /api/admin/logs/export`

### Platform Analytics (7 endpoints)
- `GET /api/admin/platform-analytics/enrollments`
- `GET /api/admin/platform-analytics/payments`
- `GET /api/admin/platform-analytics/users`
- `GET /api/admin/platform-analytics/courses`
- `POST /api/admin/platform-analytics/custom`
- `POST /api/admin/platform-analytics/export`
- `POST /api/admin/platform-analytics/schedule`

## 📝 IMPLEMENTATION REQUIREMENTS

### Task 6.1: Create Shared Components

Create reusable components in `components/admin/shared/`:

1. **AnalyticsCard.jsx**
   - Display metric cards with title, value, change percentage, icon
   - Support loading and error states
   - Responsive design

2. **ChartWrapper.jsx**
   - Wrapper for chart libraries (Chart.js or Recharts)
   - Support line, bar, pie, area charts
   - Responsive and themed

3. **DataTable.jsx**
   - Sortable columns
   - Pagination
   - Search/filter
   - Row actions (edit, delete, view)
   - Export functionality

4. **FilterBar.jsx**
   - Date range picker
   - Status filters
   - Search input
   - Clear filters button

5. **ExportButton.jsx**
   - Export to CSV/PDF
   - Loading state during export
   - Success/error feedback

6. **AIInsightPanel.jsx**
   - Display AI-generated insights
   - Collapsible panel
   - Loading skeleton

7. **DateRangePicker.jsx**
   - Start and end date selection
   - Preset ranges (today, week, month, year)
   - Custom range input

### Task 6.2: Analytics Dashboard Page

**Route**: `/dashboard/admin/analytics`

**Features**:
- Platform overview cards (revenue, users, enrollments, courses)
- Revenue charts (daily, weekly, monthly trends)
- User growth charts
- Enrollment trends
- Top performing courses table
- AI insights panel
- Date range filtering
- Export functionality

**API Calls**:
- `GET /api/admin/analytics/overview`
- `GET /api/admin/analytics/revenue?startDate=X&endDate=Y`
- `GET /api/admin/analytics/users?startDate=X&endDate=Y`
- `GET /api/admin/analytics/enrollments?startDate=X&endDate=Y`
- `GET /api/admin/analytics/courses`

### Task 6.3: Category Management Page

**Route**: `/dashboard/admin/categories`

**Features**:
- Category list with course counts
- Create category modal/form
- Edit category inline or modal
- Delete with confirmation (protection if courses exist)
- Search functionality
- Real-time validation

**API Calls**:
- `GET /api/admin/categories`
- `GET /api/admin/categories/search?q=term`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`

### Task 6.4: Coupon Management Page

**Route**: `/dashboard/admin/coupons`

**Features**:
- Coupon list with status indicators
- Create coupon form with validation
- Edit coupon functionality
- Activate/deactivate toggle
- Usage analytics display
- Search and filter by status
- Expiration warnings

**API Calls**:
- `GET /api/admin/coupons`
- `GET /api/admin/coupons/search?q=term&status=active`
- `GET /api/admin/coupons/analytics`
- `POST /api/admin/coupons`
- `PUT /api/admin/coupons/:id`
- `PATCH /api/admin/coupons/:id/status`
- `DELETE /api/admin/coupons/:id`

### Task 6.5: Financial Dashboard Page

**Route**: `/dashboard/admin/financial`

**Features**:
- Financial overview cards
- Revenue breakdown charts
- Payout management table
- Transaction history
- Process payout functionality
- Export functionality
- Filter by date, instructor, course

**API Calls**:
- `GET /api/admin/financial/overview`
- `GET /api/admin/financial/revenue`
- `GET /api/admin/financial/payouts`
- `POST /api/admin/financial/payouts/:id/process`
- `GET /api/admin/financial/transactions`

### Task 6.6: System Settings Page

**Route**: `/dashboard/admin/settings`

**Features**:
- Tabbed interface (General, Email, Payment, Course)
- Settings forms with validation
- Save functionality
- Change history display
- Reset to defaults option
- Success/error feedback

**API Calls**:
- `GET /api/admin/settings`
- `GET /api/admin/settings/:category`
- `PUT /api/admin/settings/:key`
- `POST /api/admin/settings/bulk`

### Task 6.7: Instructor Management Page

**Route**: `/dashboard/admin/instructors`

**Features**:
- Instructor list with metrics
- Instructor detail view/modal
- Performance analytics display
- Status management (suspend/activate)
- Payout information display
- Search and filter functionality

**API Calls**:
- `GET /api/admin/instructors`
- `GET /api/admin/instructors/:id`
- `GET /api/admin/instructors/:id/analytics`
- `PATCH /api/admin/instructors/:id/status`
- `GET /api/admin/instructors/:id/payouts`

### Task 6.8: Enhanced Reports Page

**Route**: `/dashboard/admin/reports`

**Features**:
- Report list with type badges (student/instructor)
- Priority indicators for instructor reports
- Attachment display and download
- Internal notes section
- Resolution workflow UI
- Filter by type, status, priority, date
- Search functionality

**API Calls**:
- `GET /api/reports?reporterType=student|instructor`
- `PUT /api/reports/:id`
- `POST /api/reports/:id/notes`
- `POST /api/reports/:id/resolve`

### Task 6.9: Marketing Tools Page

**Route**: `/dashboard/admin/marketing`

**Features**:
- Campaign list with status
- Create campaign form
- Featured courses management
- Banner upload and management
- Campaign analytics display
- AI suggestions panel
- Drag-and-drop for featured courses ordering

**API Calls**:
- `GET /api/admin/marketing/campaigns`
- `POST /api/admin/marketing/campaigns`
- `PUT /api/admin/marketing/campaigns/:id`
- `DELETE /api/admin/marketing/campaigns/:id`
- `GET /api/admin/marketing/campaigns/:id/analytics`
- `GET /api/admin/marketing/featured-courses`
- `POST /api/admin/marketing/featured-courses`

### Task 6.10: Notification Management Page

**Route**: `/dashboard/admin/notifications`

**Features**:
- Notification creation form
- Target audience selector (all, students, instructors)
- Scheduling functionality
- Notification history table
- Engagement metrics display
- AI content generation button
- Preview before sending

**API Calls**:
- `POST /api/admin/notifications/broadcast`
- `GET /api/admin/notifications/history`
- `GET /api/admin/notifications/statistics`
- `GET /api/admin/notifications/scheduled`
- `GET /api/admin/notifications/:id/metrics`

### Task 6.11: Audit Logs Page

**Route**: `/dashboard/admin/logs`

**Features**:
- Log type tabs (Audit, Payment, Enrollment, Errors)
- Comprehensive filtering
- Search functionality
- Log detail modal
- Export functionality
- Log analytics charts
- Real-time updates (optional)

**API Calls**:
- `GET /api/admin/logs/audit`
- `GET /api/admin/logs/payments`
- `GET /api/admin/logs/enrollments`
- `GET /api/admin/logs/errors`
- `GET /api/admin/logs/analytics`
- `GET /api/admin/logs/search?q=term`
- `POST /api/admin/logs/export`

### Task 6.12: Platform Analytics Page

**Route**: `/dashboard/admin/platform-analytics`

**Features**:
- Enrollment analytics charts
- Payment analytics display
- User activity metrics
- Course performance analytics
- Custom report builder
- Export functionality
- Scheduled reports management

**API Calls**:
- `GET /api/admin/platform-analytics/enrollments`
- `GET /api/admin/platform-analytics/payments`
- `GET /api/admin/platform-analytics/users`
- `GET /api/admin/platform-analytics/courses`
- `POST /api/admin/platform-analytics/custom`
- `POST /api/admin/platform-analytics/export`
- `POST /api/admin/platform-analytics/schedule`

### Task 6.13: Update Admin Sidebar Navigation

**Location**: Update existing sidebar component

**Features**:
- Add new menu items for all pages
- Add icons for each section
- Active state indicators
- Organize menu items logically
- Collapsible sections
- Badge for notifications/alerts

## 🎨 DESIGN GUIDELINES

### UI/UX Requirements:
1. **Consistent Design**: Follow existing dashboard design patterns
2. **Responsive**: Mobile-first approach, works on all screen sizes
3. **Accessible**: WCAG 2.1 AA compliance
4. **Loading States**: Show skeletons/spinners during data fetch
5. **Error Handling**: User-friendly error messages
6. **Success Feedback**: Toast notifications for actions
7. **Confirmation Dialogs**: For destructive actions
8. **Form Validation**: Real-time validation with clear error messages

### Color Scheme:
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray scale

### Typography:
- Headings: Font weight 600-700
- Body: Font weight 400
- Small text: Font size 0.875rem

## 🔧 TECHNICAL REQUIREMENTS

### API Integration:
1. Create API client with authentication
2. Handle token refresh
3. Implement error interceptors
4. Add request/response logging (dev mode)
5. Support query parameters and request bodies

### State Management:
1. Use React hooks for local state
2. Context API for shared state (optional)
3. SWR or React Query for data fetching (recommended)
4. Optimistic updates where appropriate

### Performance:
1. Lazy load components
2. Implement pagination for large lists
3. Debounce search inputs
4. Cache API responses
5. Use React.memo for expensive components

### Security:
1. Validate all user inputs
2. Sanitize data before display
3. Implement CSRF protection
4. Use HTTPS only
5. Don't expose sensitive data in client

## 📦 DEPENDENCIES TO INSTALL

```bash
# Charts
npm install recharts
# or
npm install chart.js react-chartjs-2

# Date handling
npm install date-fns

# Forms
npm install react-hook-form zod @hookform/resolvers

# Data fetching (choose one)
npm install swr
# or
npm install @tanstack/react-query

# Icons
npm install lucide-react

# Notifications
npm install sonner
# or use existing toast library

# File upload
npm install react-dropzone

# Rich text editor (for notifications)
npm install @tiptap/react @tiptap/starter-kit
```

## 🚀 IMPLEMENTATION APPROACH

### Phase 1: Foundation (Start Here)
1. Create API client utilities
2. Set up authentication context
3. Create shared components (Task 6.1)
4. Update sidebar navigation (Task 6.13)

### Phase 2: Core Pages
1. Analytics Dashboard (Task 6.2) - Most important
2. Notifications (Task 6.10) - High priority
3. Logs (Task 6.11) - High priority

### Phase 3: Management Pages
1. Categories (Task 6.3)
2. Coupons (Task 6.4)
3. Settings (Task 6.6)
4. Instructors (Task 6.7)

### Phase 4: Advanced Features
1. Financial Dashboard (Task 6.5)
2. Reports (Task 6.8)
3. Marketing (Task 6.9)
4. Platform Analytics (Task 6.12)

## ✅ ACCEPTANCE CRITERIA

Each page must:
- [ ] Load data from correct API endpoints
- [ ] Display loading states
- [ ] Handle errors gracefully
- [ ] Show success feedback for actions
- [ ] Be responsive (mobile, tablet, desktop)
- [ ] Include proper form validation
- [ ] Support search/filter where applicable
- [ ] Include export functionality where specified
- [ ] Follow existing design patterns
- [ ] Be accessible (keyboard navigation, screen readers)

## 📚 REFERENCE FILES

Key files to reference:
- `backend/routes/admin.routes.js` - All API endpoints
- `backend/controllers/*.controller.js` - Request/response formats
- `.kiro/specs/admin-dashboard-enhancement/requirements.md` - Feature requirements
- `.kiro/specs/admin-dashboard-enhancement/design.md` - Design specifications
- Existing dashboard pages - For design consistency

## 🎯 PROMPT TO USE IN NEW CHAT

Copy and paste this into your new chat:

---

**PROMPT START**

I need to implement the admin dashboard frontend for an online courses platform. Here's the context:

**Backend Status**: ✅ Complete
- 68 API endpoints ready at `/api/admin/*`
- All services, controllers, and routes implemented
- Redis and Bull queue infrastructure set up
- Authentication and authorization working

**Frontend Status**: 🔄 Needs Implementation
- 13 admin pages to build (Tasks 6.1-6.13)
- Shared components library
- API integration layer
- State management

**Tech Stack**:
- Next.js 14+ (App Router)
- React, Tailwind CSS, shadcn/ui
- Backend API at `http://localhost:3000`

**Implementation Order**:
1. Create shared components (AnalyticsCard, DataTable, ChartWrapper, etc.)
2. Set up API client with authentication
3. Build Analytics Dashboard page (most important)
4. Build Notifications page
5. Build remaining pages

**Key Requirements**:
- Connect to existing API endpoints
- Responsive design
- Loading and error states
- Form validation
- Export functionality
- Search and filtering

Please start by:
1. Creating the API client utility in `lib/api/client.js`
2. Creating shared components in `components/admin/shared/`
3. Building the Analytics Dashboard page at `app/dashboard/admin/analytics/page.js`

Refer to `FRONTEND_IMPLEMENTATION_PROMPT.md` for complete specifications, API endpoints, and requirements.

**PROMPT END**

---

## 💡 TIPS FOR SUCCESS

1. **Start Small**: Build one complete page first as a reference
2. **Reuse Components**: Create shared components early
3. **Test API Calls**: Test each endpoint in Postman first
4. **Mock Data**: Use mock data during development
5. **Incremental**: Build feature by feature, not page by page
6. **Error Handling**: Implement comprehensive error handling
7. **User Feedback**: Add loading states and success messages
8. **Code Quality**: Keep components small and focused
9. **Documentation**: Comment complex logic
10. **Testing**: Test on different screen sizes

## 🆘 TROUBLESHOOTING

### API Connection Issues:
- Check backend is running on port 3000
- Verify CORS is configured
- Check authentication token is valid
- Use browser dev tools network tab

### Component Issues:
- Check prop types
- Verify data structure from API
- Use React DevTools
- Check console for errors

### Styling Issues:
- Verify Tailwind classes
- Check responsive breakpoints
- Use browser inspector
- Test on different devices

## 📞 NEXT STEPS

After completing frontend implementation:
1. Integration testing
2. User acceptance testing
3. Performance optimization
4. Security audit
5. Documentation
6. Deployment

Good luck with the implementation! 🚀
